# n8n Booking Workflow Setup Guide

## Overview

Your new custom booking system sends booking requests to n8n, which then:
1. Creates a Google Calendar event
2. Sends confirmation email to the client
3. Sends notification to you
4. Optionally adds to CRM

---

## Step 1: Create n8n Workflow

### Webhook Trigger

1. **Add Webhook Node**
   - Node: `Webhook`
   - Method: `POST`
   - Path: `/booking` (or your custom path)
   - Response: `Respond Immediately`

### Expected Payload

The booking system sends this JSON:

```json
{
  "source": "automagicly-website",
  "submittedAt": "2024-01-15T10:30:00.000Z",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "date": "2024-01-20",
  "time": "14:00",
  "dateTime": "2024-01-20 14:00",
  "timezone": "America/New_York",
  "notes": "Manual invoice processing",
  "type": "AI Audit Booking"
}
```

---

## Step 2: Create Google Calendar Event

### Add Google Calendar Node

1. **Node**: `Google Calendar`
2. **Operation**: `Create Event`
3. **Configuration**:

```
Calendar: {{ $json.calendar || "primary" }}
Start: {{ $json.dateTime }}
End: {{ $json.dateTime + 30 minutes }}
Summary: AI Audit - {{ $json.name }} ({{ $json.company }})
Description:
  Client: {{ $json.name }}
  Company: {{ $json.company }}
  Email: {{ $json.email }}
  Notes: {{ $json.notes }}

  Booked via AutoMagicly website

Location: Google Meet (auto-generated)
Attendees: {{ $json.email }}
Send Updates: Yes
```

**Google Meet Settings**:
- Check "Add conference data"
- This automatically creates a Google Meet link

---

## Step 3: Send Confirmation Email

### Add Gmail/SendGrid Node

1. **Node**: `Gmail` or `SendGrid`
2. **Operation**: `Send Email`
3. **Configuration**:

```
To: {{ $json.email }}
CC: your-email@automagicly.com
Subject: Your AI Audit is Confirmed! 📅
```

**Email Template**:

```html
<h2>Hi {{ $json.name }},</h2>

<p>Your AI Audit has been confirmed! 🎉</p>

<div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
  <h3>Booking Details:</h3>
  <p><strong>Date:</strong> {{ $json.date }}</p>
  <p><strong>Time:</strong> {{ $json.time }} ({{ $json.timezone }})</p>
  <p><strong>Duration:</strong> 30 minutes</p>
  <p><strong>Meeting Link:</strong> {{ $node["Google Calendar"].json.hangoutLink }}</p>
</div>

<h3>What to Expect:</h3>
<ul>
  <li>We'll review your current workflows</li>
  <li>Identify automation opportunities</li>
  <li>Discuss estimated time savings</li>
  <li>Answer all your questions</li>
</ul>

<h3>Before the Call:</h3>
<p>Think about:</p>
<ul>
  <li>Which tasks take the most time</li>
  <li>What tools you currently use</li>
  <li>Your biggest pain points</li>
</ul>

<p><strong>Add to Calendar:</strong> A calendar invite has been sent to you separately.</p>

<hr>

<p>Questions? Reply to this email or visit our FAQ: https://automagicly.com#faq</p>

<p>See you soon!<br>
The AutoMagicly Team</p>
```

---

## Step 4: Send Internal Notification

### Add Another Email/Slack Node

1. **Node**: `Gmail` or `Slack`
2. **Purpose**: Notify you of new bookings

**Slack Message**:
```
🎯 New AI Audit Booked!

Client: {{ $json.name }}
Company: {{ $json.company }}
Email: {{ $json.email }}
Date/Time: {{ $json.dateTime }} {{ $json.timezone }}
Notes: {{ $json.notes }}

Calendar: {{ $node["Google Calendar"].json.htmlLink }}
```

**Or Email**:
```
Subject: New Booking: {{ $json.name }} - {{ $json.company }}

New AI Audit booking:

Client: {{ $json.name }}
Company: {{ $json.company }}
Email: {{ $json.email }}
Phone: {{ $json.phone }}
Scheduled: {{ $json.dateTime }} {{ $json.timezone }}
Notes: {{ $json.notes }}

Calendar event: {{ $node["Google Calendar"].json.htmlLink }}
```

---

## Step 5: Optional - Add to CRM

### Add HubSpot/Salesforce Node

1. **Node**: `HubSpot` or your CRM
2. **Operation**: `Create/Update Contact`
3. **Configuration**:

```
Email: {{ $json.email }}
First Name: {{ $json.name.split(' ')[0] }}
Last Name: {{ $json.name.split(' ')[1] }}
Company: {{ $json.company }}
Lead Source: Website Booking
Notes: {{ $json.notes }}
Booking Date: {{ $json.dateTime }}
```

---

## Complete Workflow Structure

```
1. Webhook (Receive booking)
   ↓
2. Google Calendar (Create event)
   ↓
3. Gmail (Send confirmation to client)
   ↓
4. Slack/Email (Notify you)
   ↓
5. HubSpot/CRM (Optional - Add contact)
   ↓
6. Respond (Success message)
```

---

## Testing Your Workflow

### 1. Get Webhook URL

After creating the webhook node, copy the URL:
```
https://your-n8n.com/webhook/booking
```

### 2. Add to .env.local

```bash
NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL=https://your-n8n.com/webhook/booking
```

### 3. Test Booking

1. Run `npm run dev`
2. Go to booking section
3. Select a date & time
4. Fill in test details
5. Submit

### 4. Check:
- ✅ Google Calendar event created
- ✅ Confirmation email received
- ✅ You got notified
- ✅ CRM updated (if enabled)

---

## Customization Options

### Available Time Slots

Edit `components/CustomBooking.tsx`:

```tsx
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', // Morning
  '14:00', '14:30', '15:00', // Afternoon
  // Add your available times
];
```

### Meeting Duration

Edit the workflow:
```
End: {{ $json.dateTime + 60 minutes }} // For 1 hour
```

### Blocked Days

Edit `CustomBooking.tsx`:

```tsx
const disabledDays = [
  { before: addDays(new Date(), 1) }, // No same-day booking
  { dayOfWeek: [0, 6] }, // Block weekends
  new Date(2024, 11, 25), // Block specific dates (Christmas)
];
```

### Buffer Time

To prevent back-to-back bookings, add logic in n8n:

1. **Check Google Calendar** node before creating
2. **Look for conflicts** in the time range
3. **Return error** if time is taken

---

## Advanced Features

### 1. Email Reminders

Add to workflow:
- **Wait** node: Wait until 24 hours before
- **Gmail** node: Send reminder
- **Wait** node: Wait until 1 hour before
- **Gmail** node: Send final reminder

### 2. No-Show Tracking

Add after the event:
- **Wait** node: Wait until after meeting time
- **Check** if they joined (via calendar API)
- **Tag** in CRM as no-show if needed

### 3. Automated Follow-Up

Add after meeting:
- **Wait** node: Wait 2 hours
- **Gmail** node: Send follow-up with proposal
- **Calendly** link for next meeting

---

## Troubleshooting

### Booking not creating calendar event?

**Check**:
1. Google Calendar node is authenticated
2. Calendar exists and you have write access
3. Timezone is valid
4. Date/time format is correct

### Confirmation email not sending?

**Check**:
1. Gmail/SendGrid node is authenticated
2. Email address is valid
3. Check spam folder
4. Verify template has no syntax errors

### Webhook 404 error?

**Check**:
1. Workflow is active (not paused)
2. Webhook URL is correct in .env.local
3. n8n is running
4. Webhook path matches

---

## Production Checklist

Before going live:

- [ ] Test complete workflow end-to-end
- [ ] Verify Google Calendar integration
- [ ] Test confirmation emails
- [ ] Check timezone handling
- [ ] Test on mobile device
- [ ] Set up error notifications
- [ ] Add webhook authentication (optional)
- [ ] Monitor webhook logs

---

## Benefits vs Calendly

✅ **Custom branding** - Matches your site perfectly
✅ **Full control** - Customize everything
✅ **No Calendly fees** - Free (except n8n hosting)
✅ **Data ownership** - All data in your n8n
✅ **Better UX** - Integrated into your site
✅ **Flexible automation** - Add any logic you want
✅ **Professional look** - No third-party iframe

---

## Support

Questions? The booking system is fully functional and sends data to your n8n webhook. Just set up the workflow above to handle:

1. Creating calendar events
2. Sending confirmation emails
3. Notifying your team

You now have a **beautiful, custom booking system** that's better than Calendly! 🎉
