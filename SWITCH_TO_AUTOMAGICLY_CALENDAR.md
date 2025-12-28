# How to Switch to Your "automagicly" Calendar

## Current Situation
- Currently using: `rashad.barnett@gmail.com` (your primary calendar)
- Want to use: `automagicly` calendar (not yet accessible)

## Step 1: Find Your "automagicly" Calendar ID

### Method 1: Google Calendar Web
1. Go to [Google Calendar](https://calendar.google.com)
2. Look in the left sidebar under "My calendars"
3. Find your **"automagicly"** calendar
4. Click the **three dots** next to it
5. Click **"Settings and sharing"**
6. Scroll down to the section **"Integrate calendar"**
7. Copy the **"Calendar ID"**
   - It will look like: `automagicly@group.calendar.google.com` or similar
   - Or it might be: `xxxxxxxxxxxxxxxxxxx@group.calendar.google.com`

### Method 2: If You Don't See "automagicly" Calendar
If you don't have an "automagicly" calendar yet, you need to create it:

1. Go to [Google Calendar](https://calendar.google.com)
2. In the left sidebar, next to "Other calendars" click the **+** button
3. Click **"Create new calendar"**
4. Name: **automagicly**
5. Description: **Booking calendar for automagicly business**
6. Click **"Create calendar"**
7. Then follow Method 1 above to get the Calendar ID

---

## Step 2: Share the Calendar with Service Account

1. While still in the calendar settings (from Step 1)
2. Scroll to **"Share with specific people or groups"**
3. Click **"Add people and groups"**
4. Enter: `automagicly-calendar-reader@automagicly.iam.gserviceaccount.com`
5. Set permission to: **"See all event details"**
6. Click **"Send"** (don't worry, no email will actually be sent)

---

## Step 3: Update .env.local

Once you have the calendar ID from Step 1:

1. Open `.env.local` in your project
2. Find the line: `GOOGLE_CALENDAR_ID=rashad.barnett@gmail.com`
3. Replace it with your new calendar ID:

```bash
# Example - replace with YOUR actual calendar ID
GOOGLE_CALENDAR_ID=automagicly@group.calendar.google.com
```

Or if you prefer, I can update it for you. Just tell me the Calendar ID!

---

## Step 4: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

---

## Step 5: Verify It Works

```bash
# Check which calendar is being used
curl -s http://localhost:3000/api/calendar/availability | python3 -m json.tool

# Check for events
curl -s http://localhost:3000/api/calendar/raw-events | python3 -m json.tool
```

You should see your "automagicly" calendar ID in the response!

---

## Quick Reference Commands

```bash
# Find accessible calendars
curl -s http://localhost:3000/api/calendar/find-automagicly | python3 -m json.tool

# Check current calendar
grep GOOGLE_CALENDAR_ID .env.local
```

---

## Why Use a Separate Calendar?

Good reasons to use a dedicated "automagicly" calendar:
- ✅ Keep business bookings separate from personal events
- ✅ Easier to manage availability
- ✅ Can share with team members if needed
- ✅ Cleaner organization

---

## What Happens After Switch?

Once switched to the "automagicly" calendar:
- The booking system will check THAT calendar for busy dates
- Events in your primary calendar won't block booking slots
- Only events in the "automagicly" calendar will be blocked

If you want BOTH calendars to block dates, let me know and I can set that up!
