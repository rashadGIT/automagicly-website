# Google Calendar API Setup Guide

## Overview

This guide shows you how to connect your Google Calendar to automatically block out busy dates in your booking system. The system queries Google Calendar API directly from your Next.js backend (no N8N executions needed).

---

## How It Works

1. **Booking page loads** → Frontend calls `/api/calendar/availability`
2. **API route** → Queries Google Calendar API using service account
3. **Google Calendar** → Returns all events in date range
4. **API processes** → Extracts unique dates from events
5. **Calendar updates** → Busy dates are disabled in the booking calendar

**Benefits**:
- ✅ No N8N executions consumed
- ✅ Fast and efficient
- ✅ Direct API access
- ✅ Secure backend authentication

---

## Step 1: Create Google Cloud Project

### 1. Go to Google Cloud Console

Visit: [https://console.cloud.google.com](https://console.cloud.google.com)

### 2. Create a New Project

1. Click the project dropdown at the top
2. Click "New Project"
3. Name it: `AutoMagicly Booking` (or your choice)
4. Click "Create"
5. Wait for the project to be created
6. Select your new project from the dropdown

---

## Step 2: Enable Google Calendar API

### 1. Open API Library

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click **"Enable"**

---

## Step 3: Create Service Account

### 1. Go to Service Accounts

1. In the left sidebar, go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"Service Account"**

### 2. Fill in Service Account Details

**Step 1: Service account details**
- Service account name: `automagicly-calendar-reader`
- Service account ID: (auto-filled)
- Description: `Read-only access to Google Calendar for booking system`
- Click **"Create and Continue"**

**Step 2: Grant this service account access to project** (Optional)
- Role: **None needed** (we'll grant calendar access directly)
- Click **"Continue"**

**Step 3: Grant users access to this service account** (Optional)
- Skip this step
- Click **"Done"**

### 3. Create Service Account Key

1. Find your newly created service account in the list
2. Click on the service account email
3. Go to the **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select **JSON** format
6. Click **"Create"**

**Important**: A JSON file will download automatically. Keep this file secure!

---

## Step 4: Share Your Calendar with Service Account

### 1. Open Google Calendar

Go to [https://calendar.google.com](https://calendar.google.com)

### 2. Share Your Calendar

1. Find the calendar you want to use (usually "Primary")
2. Click the **three dots** next to the calendar name
3. Click **"Settings and sharing"**
4. Scroll down to **"Share with specific people or groups"**
5. Click **"Add people and groups"**

### 3. Add Service Account

1. **Email**: Paste your service account email from Step 3
   - Format: `automagicly-calendar-reader@your-project.iam.gserviceaccount.com`
2. **Permission**: Select **"See all event details"**
3. Click **"Send"**

**Note**: You won't receive a confirmation. The service account now has access.

---

## Step 5: Configure Environment Variables

### 1. Open the JSON Key File

Open the JSON file that was downloaded in Step 3. It looks like:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "automagicly-calendar-reader@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### 2. Create/Update .env.local

Create or update your `.env.local` file in the project root:

```bash
# Copy the "client_email" value
GOOGLE_SERVICE_ACCOUNT_EMAIL=automagicly-calendar-reader@your-project.iam.gserviceaccount.com

# Copy the ENTIRE "private_key" value (including \n characters)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Your calendar ID (usually "primary" or your email)
GOOGLE_CALENDAR_ID=primary
```

**Important Notes**:
- ✅ Keep the quotes around `GOOGLE_PRIVATE_KEY`
- ✅ Keep the `\n` characters in the private key
- ✅ Use `primary` for your main calendar
- ✅ Never commit `.env.local` to git (it's in `.gitignore`)

### 3. Restart Your Dev Server

```bash
npm run dev
```

---

## Step 6: Test the Integration

### 1. Add Test Events to Google Calendar

1. Go to [Google Calendar](https://calendar.google.com)
2. Create a few test events over the next week
3. Make sure they're in the calendar you shared with the service account

### 2. Test the Booking Page

1. Go to your booking section (usually at `http://localhost:3000`)
2. Watch for "Checking availability..." message
3. The calendar should load and display:
   - ✅ Past dates grayed out
   - ✅ Weekends grayed out
   - ✅ **Dates with events grayed out** ← This is new!

### 3. Check Browser Console

Open browser dev tools (F12) and check for:
- Successful API calls to `/api/calendar/availability`
- Array of busy dates being returned
- No error messages

### 4. Test the API Directly

Visit in your browser:
```
http://localhost:3000/api/calendar/availability
```

Expected response:
```json
{
  "busyDates": ["2024-12-26", "2024-12-27", "2024-12-30"]
}
```

---

## Troubleshooting

### Issue: Getting Empty Array `{ busyDates: [] }`

**Check**:
1. ✅ Service account email is correctly set in `.env.local`
2. ✅ Private key is correctly formatted (with quotes and `\n`)
3. ✅ Calendar has been shared with the service account email
4. ✅ Google Calendar API is enabled in Google Cloud Console
5. ✅ You restarted the dev server after updating `.env.local`

### Issue: Error 403 "Forbidden"

**Cause**: Service account doesn't have access to the calendar

**Fix**:
1. Double-check you shared the calendar with the **exact** service account email
2. Permission is set to "See all event details" (not just "See only free/busy")
3. Wait a few minutes for permissions to propagate

### Issue: Error 401 "Unauthorized"

**Cause**: Invalid credentials

**Fix**:
1. Verify `GOOGLE_SERVICE_ACCOUNT_EMAIL` matches the JSON file
2. Verify `GOOGLE_PRIVATE_KEY` is copied exactly (including `\n`)
3. Make sure the private key is wrapped in quotes in `.env.local`
4. Try regenerating the service account key

### Issue: Error 404 "Not Found"

**Cause**: Calendar ID is incorrect

**Fix**:
1. Try using `primary` as the calendar ID
2. Or get your calendar ID:
   - Go to Calendar Settings
   - Scroll to "Integrate calendar"
   - Copy the "Calendar ID"

### Issue: Dates Not Being Blocked

**Check**:
1. ✅ Events exist in the date range (next 60 days)
2. ✅ Events are in the calendar you shared
3. ✅ Browser console shows successful API response
4. ✅ Try refreshing the page
5. ✅ Check for JavaScript errors in console

---

## Advanced Configuration

### Use a Specific Calendar (Not Primary)

If you want to use a specific calendar instead of your primary:

1. **Get Calendar ID**:
   - Go to Google Calendar settings
   - Click on the calendar you want to use
   - Scroll to "Integrate calendar"
   - Copy the "Calendar ID" (looks like an email)

2. **Update .env.local**:
   ```bash
   GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
   ```

### Block Only All-Day Events

Edit `app/api/calendar/availability/route.ts:47-56`:

```typescript
events.forEach((event) => {
  // Only block all-day events (not timed events)
  if (event.start?.date) { // All-day events use 'date', not 'dateTime'
    busyDatesSet.add(event.start.date);
  }
});
```

### Block Only Long Events (4+ hours)

```typescript
events.forEach((event) => {
  const startDate = event.start?.date || event.start?.dateTime;

  if (event.start?.date) {
    // All-day event - always block
    busyDatesSet.add(startDate!);
  } else if (event.start?.dateTime && event.end?.dateTime) {
    // Calculate duration
    const duration = new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime();
    const hours = duration / (1000 * 60 * 60);

    // Only block if event is 4+ hours
    if (hours >= 4) {
      const dateOnly = event.start.dateTime.split('T')[0];
      busyDatesSet.add(dateOnly);
    }
  }
});
```

### Add Caching to Reduce API Calls

Add caching to the API route:

```typescript
// At the top of the file
let cachedData: { busyDates: string[], timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// In the GET function, before calling Google API
if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
  return NextResponse.json({ busyDates: cachedData.busyDates });
}

// After getting busyDates from Google API
cachedData = { busyDates, timestamp: Date.now() };
```

### Block Multiple Calendars

To check multiple calendars:

```typescript
const calendars = [
  'primary',
  'work-calendar@group.calendar.google.com',
  'personal@gmail.com'
];

const allBusyDates = new Set<string>();

for (const calendarId of calendars) {
  const response = await calendar.events.list({
    calendarId,
    // ... other params
  });

  response.data.items?.forEach((event) => {
    const startDate = event.start?.date || event.start?.dateTime;
    if (startDate) {
      allBusyDates.add(startDate.split('T')[0]);
    }
  });
}
```

---

## Security Best Practices

### 1. Protect Your Credentials

- ✅ Never commit `.env.local` to git
- ✅ Never share your private key
- ✅ Never expose credentials in frontend code
- ✅ Add `.env.local` to `.gitignore` (already done)

### 2. Use Read-Only Permissions

The service account only has **read-only** access:
- ✅ Can read events
- ❌ Cannot create events
- ❌ Cannot modify events
- ❌ Cannot delete events

### 3. Limit Calendar Access

Only share the specific calendar you need:
- Don't share all calendars
- Use "See all event details" permission (needed to get dates)

### 4. Production Deployment

For production (Vercel, Netlify, etc.):

1. Go to your hosting platform's environment variables
2. Add the same three variables:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID`
3. Deploy your app

**Note**: Some platforms may require you to base64 encode the private key.

---

## How The Code Works

### API Route (`app/api/calendar/availability/route.ts`)

```typescript
// 1. Initialize Google Calendar API with service account
const auth = new google.auth.JWT({
  email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
});

// 2. Query calendar for events in date range
const response = await calendar.events.list({
  calendarId: GOOGLE_CALENDAR_ID,
  timeMin: startDate,
  timeMax: endDate,
  singleEvents: true,
});

// 3. Extract unique dates from events
events.forEach((event) => {
  const date = event.start?.date || event.start?.dateTime;
  busyDatesSet.add(date.split('T')[0]);
});

// 4. Return sorted array of dates
return { busyDates: Array.from(busyDatesSet).sort() };
```

### Frontend (`components/CustomBooking.tsx:47-64`)

```typescript
// Fetch busy dates on component mount
useEffect(() => {
  const dates = await fetchBusyDates();
  setBusyDates(dates);
}, []);

// Add to disabled days
const disabledDays = [
  { before: addDays(new Date(), 1) },
  { dayOfWeek: [0, 6] },
  ...busyDates // ← Your calendar events
];
```

---

## Production Checklist

Before going live:

- [ ] Google Calendar API enabled in Google Cloud
- [ ] Service account created and key downloaded
- [ ] Calendar shared with service account email
- [ ] Environment variables set correctly
- [ ] Tested with real calendar events
- [ ] Verified dates are being blocked
- [ ] Checked error handling works
- [ ] Tested on mobile devices
- [ ] Environment variables added to production hosting
- [ ] Removed any test/debug console.logs

---

## Cost

**Google Calendar API** is **FREE** for most use cases:
- ✅ Free tier: 1,000,000 requests/day
- ✅ Your booking page will use ~1 request per page load
- ✅ Even with 10,000 visitors/day, you're well within limits

**No N8N executions used!** 🎉

---

## Support

You now have **direct Google Calendar integration** with zero N8N execution costs!

When you add events to your Google Calendar, they'll automatically be blocked in your booking form. Fast, efficient, and free! 🚀
