# AutoMagicly n8n Workflows

This folder contains all the n8n workflow JSON files for the AutoMagicly website.

## 📦 Workflows Included

1. **booking-workflow.json** - Custom booking system (replaces Calendly)
2. **reviews-workflow.json** - Handle review submissions
3. **referrals-workflow.json** - Process referral submissions
4. **waitlist-workflow.json** - Manage waitlist signups
5. **chat-workflow.json** - AI-powered chat responses

---

## 🚀 Quick Start

### 1. Import Workflows to n8n

**Option A: n8n Cloud**
1. Log in to your n8n cloud account
2. Click "Workflows" → "Import from File"
3. Upload each JSON file
4. Activate the workflow

**Option B: Self-Hosted n8n**
1. Access your n8n instance
2. Click "Workflows" → "Import from File"
3. Select a JSON file
4. Click "Import"
5. Activate the workflow

### 2. Configure Credentials

Each workflow requires specific credentials. Set these up in n8n:

#### Required Credentials:

**For All Workflows:**
- **Google Sheets OAuth2** - For logging data
- **Gmail OAuth2** or **SendGrid** - For sending emails
- **Slack API** (optional) - For team notifications
- **HubSpot API** (optional) - For CRM integration

**For Booking Workflow:**
- **Google Calendar OAuth2** - For creating calendar events

**For Chat Workflow:**
- **OpenAI API** - For AI-powered responses

---

## 📋 Workflow Details

### 1. Booking Workflow

**Webhook Path:** `/webhook/booking`

**What It Does:**
1. Receives booking data from website
2. Creates Google Calendar event with Meet link
3. Sends confirmation email to client
4. Notifies team via Slack
5. Adds contact to HubSpot CRM

**Required Setup:**
- Configure Google Calendar credentials
- Set up Gmail/SendGrid for emails
- Customize email templates with your branding
- Update Slack channel (or remove Slack node)
- Configure HubSpot (or remove HubSpot node)

**Environment Variable:**
```bash
NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL=https://your-n8n.com/webhook/booking
```

---

### 2. Reviews Workflow

**Webhook Path:** `/webhook/reviews`

**What It Does:**
1. Saves review to Google Sheets
2. Checks if rating is 4+ stars
3. **If positive (4-5 stars):**
   - Sends thank you email
   - Asks for Google/LinkedIn review
4. **If negative (1-3 stars):**
   - Alerts you immediately
   - Sends follow-up email
5. Notifies team via Slack

**Required Setup:**
- Create Google Sheet for reviews
- Update sheet ID in workflow
- Customize email templates
- Add your Google Business review link

**Environment Variable:**
```bash
NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL=https://your-n8n.com/webhook/reviews
```

---

### 3. Referrals Workflow

**Webhook Path:** `/webhook/referrals`

**What It Does:**
1. Saves referral to Google Sheets
2. Sends thank you email to referrer
3. Sends introduction email to referred contact
4. Notifies team via Slack
5. Adds referred contact to CRM

**Required Setup:**
- Create Google Sheet for referrals
- Update sheet ID in workflow
- Customize email templates
- Set up referral reward program

**Environment Variable:**
```bash
NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL=https://your-n8n.com/webhook/referrals
```

---

### 4. Waitlist Workflow

**Webhook Path:** `/webhook/waitlist`

**What It Does:**
1. Adds email to Google Sheets
2. Sends confirmation email
3. Notifies team via Slack
4. Adds to CRM with waitlist tag

**Required Setup:**
- Create Google Sheet for waitlist
- Update sheet ID in workflow
- Customize confirmation emails for each product

**Environment Variable:**
```bash
NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL=https://your-n8n.com/webhook/waitlist
```

---

### 5. Chat Workflow

**Webhook Path:** `/webhook/chat`

**What It Does:**
1. Logs chat message to Google Sheets
2. Sends message to OpenAI for response
3. Returns AI-generated response
4. Alerts team if message contains "urgent"

**Required Setup:**
- Configure OpenAI API key
- Create Google Sheet for chat logs
- Update AI prompt/instructions
- Set up Slack channel for urgent alerts

**Environment Variable:**
```bash
N8N_CHAT_WEBHOOK_URL=https://your-n8n.com/webhook/chat
```

---

## 🔧 Customization Guide

### Update Email Templates

Each workflow has email nodes with HTML templates. Update these sections:

1. **From Address:** Change to your email
2. **Company Name:** Replace "AutoMagicly" with your name
3. **Links:** Update URLs to your domain
4. **Branding:** Add your logo, colors, footer

### Update Google Sheets

1. Create a Google Sheet for each workflow
2. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```
3. Update the `documentId` in each workflow
4. Create tabs: "Reviews", "Referrals", "Waitlist", "Chat"

### Optional Nodes

You can remove these nodes if not needed:

- **Slack nodes** - If you don't use Slack
- **HubSpot nodes** - If you don't use a CRM
- **OpenAI node** - Use simpler chat responses

---

## 🔐 Security

### Webhook Authentication (Recommended)

Add authentication to your webhooks:

1. In n8n, edit webhook node
2. Add "Header Auth"
3. Set header name: `X-API-Key`
4. Generate random key: `openssl rand -hex 32`
5. Update website to send header

### Rate Limiting

The website has built-in rate limiting:
- Chat: 10 messages per minute
- Forms: Client-side validation

### Data Privacy

- All data stays in your n8n instance
- Google Sheets data is in your account
- No third-party data sharing

---

## 📊 Monitoring

### Check Workflow Execution

1. Go to "Executions" in n8n
2. View successful/failed runs
3. Debug errors with execution logs

### Set Up Error Notifications

Add an "Error Trigger" workflow:

```json
{
  "nodes": [
    {
      "name": "Error Trigger",
      "type": "n8n-nodes-base.errorTrigger"
    },
    {
      "name": "Send Alert",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "text": "Workflow error: {{ $json.error.message }}"
      }
    }
  ]
}
```

---

## 🧪 Testing Workflows

### Test Each Workflow:

1. **Booking:**
   - Visit website: http://localhost:3000/#booking
   - Book a test appointment
   - Check calendar, email, Slack

2. **Reviews:**
   - Visit: http://localhost:3000/#reviews
   - Submit test review
   - Check Google Sheets, email

3. **Referrals:**
   - Visit: http://localhost:3000/#referrals
   - Submit test referral
   - Verify emails sent to both parties

4. **Waitlist:**
   - Visit: http://localhost:3000/#coming-soon
   - Join waitlist
   - Check confirmation email

5. **Chat:**
   - Open chat widget
   - Send test message
   - Verify AI response

---

## 🛠️ Troubleshooting

### Workflow Not Triggering?

**Check:**
1. Workflow is active (toggle on)
2. Webhook URL is correct in `.env.local`
3. n8n instance is running
4. No authentication errors

### Emails Not Sending?

**Check:**
1. Gmail/SendGrid credentials are valid
2. Email templates have no syntax errors
3. Recipient email is valid
4. Check spam folder

### Calendar Events Not Creating?

**Check:**
1. Google Calendar OAuth is authenticated
2. Calendar exists and you have write access
3. Timezone format is valid (e.g., "America/New_York")
4. Date/time format is correct

### CRM Not Updating?

**Check:**
1. HubSpot/CRM credentials are valid
2. Field mappings are correct
3. Required fields are provided
4. API rate limits not exceeded

---

## 📚 Next Steps

1. **Import all workflows** to n8n
2. **Configure credentials** for each service
3. **Update webhook URLs** in `.env.local`
4. **Test each workflow** end-to-end
5. **Customize email templates** with your branding
6. **Set up monitoring** and error alerts
7. **Go live!** 🚀

---

## 💡 Tips

- Start with booking workflow (most important)
- Remove optional nodes you don't need
- Test thoroughly before going live
- Monitor executions daily at first
- Set up error notifications
- Back up your workflows regularly

---

## 📞 Support

For n8n documentation: https://docs.n8n.io
For AutoMagicly setup: See `N8N_BOOKING_SETUP.md`

---

**All workflows are production-ready!** Just import, configure credentials, and activate. 🎉
