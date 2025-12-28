# Google Calendar Sharing Troubleshooting

## Issue: Service account can't see your calendar

You're seeing: `"totalCalendarsAccessible": 0`

## Step-by-Step Verification

### 1. Double-Check You Shared the Calendar

Go to [Google Calendar](https://calendar.google.com) and verify:

1. **Click the 3 dots** next to your calendar (left sidebar)
2. **Click "Settings and sharing"**
3. **Scroll to "Share with specific people or groups"**
4. **Verify this email is in the list**:
   ```
   automagicly-calendar-reader@automagicly.iam.gserviceaccount.com
   ```
5. **Check the permission level**: Should be **"See all event details"** (NOT "See only free/busy")

### Common Mistakes

❌ **Wrong email** - Must be EXACTLY: `automagicly-calendar-reader@automagicly.iam.gserviceaccount.com`
❌ **Wrong permission** - Must be "See all event details" not "See only free/busy"
❌ **Shared wrong calendar** - Make sure you share YOUR calendar (the one with events), not a different one
❌ **Service account from wrong project** - Make sure the service account email matches your Google Cloud project

---

## Alternative: Use Your Calendar ID Directly

If sharing isn't working, we can use your calendar ID directly instead of "primary".

### How to Get Your Calendar ID

1. **Go to Google Calendar**: https://calendar.google.com
2. **Click the 3 dots** next to your calendar → **"Settings and sharing"**
3. **Scroll down to "Integrate calendar"**
4. **Copy the "Calendar ID"**
   - It looks like: `your-email@gmail.com` or `xyz123@group.calendar.google.com`

### Update Your .env.local

Replace this line:
```bash
GOOGLE_CALENDAR_ID=primary
```

With your actual calendar ID:
```bash
GOOGLE_CALENDAR_ID=your-email@gmail.com
```

Then restart your dev server and test again.

---

## Still Not Working? Try These

### Option 1: Wait 2-5 Minutes

Google Calendar permissions can take a few minutes to propagate. After sharing:
1. Wait 2-5 minutes
2. Restart your dev server: `npm run dev`
3. Test again: Visit `http://localhost:3001/api/calendar/debug`

### Option 2: Remove and Re-add

Sometimes permissions get stuck:
1. Go to Calendar Settings → "Share with specific people"
2. **Remove** the service account email
3. **Wait 1 minute**
4. **Add it back** with "See all event details" permission
5. **Wait 2 minutes**
6. Test again

### Option 3: Verify Service Account Email

Make sure the service account email in your `.env.local` matches the one you created:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Copy the exact email of your service account
4. Update `.env.local` with the exact email
5. Restart dev server

### Option 4: Check Google Calendar API is Enabled

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Enabled APIs & services**
3. Search for "Google Calendar API"
4. Make sure it shows "Enabled"
5. If not, enable it

---

## Quick Test Commands

After making changes, test with:

```bash
# Stop the dev server (Ctrl+C)
npm run dev

# In another terminal, test the debug endpoint
curl "http://localhost:3001/api/calendar/debug"
```

You should see:
```json
{
  "totalCalendarsAccessible": 1,
  "totalEvents": 5,
  "allEvents": [
    {
      "summary": "Your Flight",
      "start": "2025-12-28T10:00:00Z"
    }
  ]
}
```

---

## Need More Help?

Run this command to see detailed error messages:

```bash
curl "http://localhost:3001/api/calendar/debug" | jq .
```

Share the output with me and I can help debug further!
