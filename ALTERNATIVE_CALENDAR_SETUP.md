# Alternative: Use Your Email Address as Calendar ID

## The Problem

Service accounts can be tricky. Even after sharing, sometimes they don't see calendars.

## Quick Fix: Use Your Email Instead of "primary"

### Step 1: Get Your Calendar ID

Your calendar ID is usually your Gmail address. For example:
- `yourname@gmail.com`
- `yourname@yourdomain.com`

Or get it from Google Calendar:
1. Go to https://calendar.google.com
2. Click 3 dots next to your calendar → "Settings and sharing"
3. Scroll to "Integrate calendar"
4. Copy the "Calendar ID"

### Step 2: Update .env.local

Open `.env.local` and change this line:

```bash
# FROM:
GOOGLE_CALENDAR_ID=primary

# TO:
GOOGLE_CALENDAR_ID=your-email@gmail.com
```

Replace `your-email@gmail.com` with your actual calendar ID.

### Step 3: Make Sure Calendar is Public OR Shared

Go to Google Calendar → Settings → Share with specific people:

**Option A: Share with service account** (try again)
- Add: `automagicly-calendar-reader@automagicly.iam.gserviceaccount.com`
- Permission: "See all event details"

**Option B: Make calendar semi-public**
- Under "Access permissions for events"
- Check "Make available to public"
- Select "See all event details"

⚠️ This makes your calendar public, so only do this temporarily for testing.

### Step 4: Test

```bash
# Restart dev server
npm run dev

# Test in another terminal
curl "http://localhost:3001/api/calendar/debug"
```

---

## Still Not Working? Verify Service Account Access

### Check in Google Cloud Console

1. Go to https://console.cloud.google.com
2. Select your project: "automagicly" or similar
3. Go to **IAM & Admin** → **Service Accounts**
4. Find: `automagicly-calendar-reader@automagicly.iam.gserviceaccount.com`
5. Verify it exists and is enabled

### Double-Check the Key File

The JSON key file you downloaded should have:
- `"client_email"`: Should match your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `"private_key"`: Should match your `GOOGLE_PRIVATE_KEY`

If you're not sure, you can **create a new key**:
1. Go to Google Cloud Console → Service Accounts
2. Click on the service account
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key" → JSON
5. Download the new JSON file
6. Update `.env.local` with the new credentials

---

## Alternative Solution: Use OAuth Instead

If service accounts continue to not work, we can switch to OAuth (user authentication).

This means YOU log in with your Google account once, and the app gets a refresh token.

### Benefits:
- ✅ No sharing needed
- ✅ Direct access to your calendar
- ✅ Works immediately

### Drawbacks:
- ⚠️ Requires initial OAuth login flow
- ⚠️ More complex setup

Let me know if you want to try this approach instead!

---

## Quick Debugging Checklist

Run through this list:

- [ ] Service account email is EXACTLY: `automagicly-calendar-reader@automagicly.iam.gserviceaccount.com`
- [ ] Calendar is shared with service account email
- [ ] Permission is "See all event details" (not "See only free/busy")
- [ ] You waited 2-5 minutes after sharing
- [ ] Dev server was restarted after any changes
- [ ] Google Calendar API is enabled in Google Cloud Console
- [ ] Tried using your actual email instead of "primary" in GOOGLE_CALENDAR_ID
- [ ] No typos in `.env.local`

---

## What's Your Calendar ID?

Tell me what you see when you:
1. Go to Google Calendar
2. Click 3 dots next to your calendar (the one with your flight)
3. Click "Settings and sharing"
4. Look at the top - what's the calendar name?
5. Scroll to "Integrate calendar" - what's the Calendar ID?

Share that with me and I can help you update the configuration!
