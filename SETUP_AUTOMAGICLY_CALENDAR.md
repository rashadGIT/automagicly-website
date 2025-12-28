# Setup Dedicated "automagicly" Calendar

## Quick Steps

### Step 1: Open Google Calendar
Go to: https://calendar.google.com

### Step 2: Check if "automagicly" Calendar Already Exists

Look in the **left sidebar** under "My calendars" - do you see a calendar named "automagicly"?

**If YES:** Skip to Step 4
**If NO:** Continue to Step 3

---

### Step 3: Create "automagicly" Calendar

1. In the left sidebar, find **"Other calendars"**
2. Click the **+** button next to it
3. Click **"Create new calendar"**
4. Fill in:
   - **Name:** `automagicly`
   - **Description:** `Business booking calendar for automagicly`
   - **Time zone:** Your timezone (should auto-detect)
5. Click **"Create calendar"**
6. You'll see it appear in your calendar list!

---

### Step 4: Get the Calendar ID

1. In the left sidebar, find your **"automagicly"** calendar
2. Click the **three dots (⋮)** next to it
3. Click **"Settings and sharing"**
4. Scroll down to the section: **"Integrate calendar"**
5. Find **"Calendar ID"**
6. It will look something like:
   - `abc123xyz@group.calendar.google.com` OR
   - Just a long string of characters

**📋 COPY THIS CALENDAR ID - you'll need it!**

---

### Step 5: Share Calendar with Service Account

**Still in the same settings page from Step 4:**

1. Scroll to the section: **"Share with specific people or groups"**
2. Click **"Add people and groups"**
3. In the email field, enter:
   ```
   automagicly-calendar-reader@automagicly.iam.gserviceaccount.com
   ```
4. Set permission to: **"See all event details"**
5. Click **"Send"**
6. ✅ Done! (No email will actually be sent)

---

### Step 6: Paste the Calendar ID Here

Once you have the Calendar ID from Step 4, **paste it in your response** and I'll update your `.env.local` file for you!

The Calendar ID should look like one of these:
- `abc123xyz@group.calendar.google.com`
- `c_1234567890abcdef@group.calendar.google.com`
- A long random string followed by `@group.calendar.google.com`

---

## What Happens After?

Once I update `.env.local`:
1. Restart dev server
2. The booking system will check ONLY the "automagicly" calendar
3. Events in your personal calendar won't affect booking availability
4. You can manage business bookings separately!

---

## Testing

After setup, you can test by:
1. Creating a test event in the "automagicly" calendar
2. Visiting: http://localhost:3000/calendar-diagnostic
3. That date should be blocked in the booking calendar

---

**Ready? Go through Steps 1-5 above, then paste the Calendar ID here!**
