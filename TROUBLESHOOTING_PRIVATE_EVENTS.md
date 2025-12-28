# Troubleshooting: Private Events Not Showing

## Current Status
```
"privateEventStats": {
    "total": 2,
    "public": 1,
    "private": 0,  ← Still 0 after trying to mark as private
    "default": 1
}
```

## Common Issues & Solutions

### Issue 1: Changed Calendar Settings Instead of Event Settings

❌ **WRONG:** Going to Calendar Settings → "Make this calendar private"
✅ **CORRECT:** Editing individual events and setting their visibility to "Private"

**How to check:**
- You should be editing a SINGLE event, not calendar-wide settings
- Look for a setting on the event itself, not in Settings menu

---

### Issue 2: Looking in Wrong Place for Visibility Setting

The "Visibility" option is sometimes hidden or in different places depending on:
- Desktop vs Mobile
- New vs Old Google Calendar interface
- Personal vs Workspace account

**Desktop (New Interface):**
1. Click on event
2. Click pencil icon (Edit)
3. Look for **"Default visibility"** dropdown (it's usually BELOW the description field)
4. Or look for a toggle/dropdown that says "Visibility" or "Privacy"

**Desktop (Old Interface):**
1. Click on event
2. Click "Edit event"
3. Scroll down past Description, Location, Guests
4. Look for **"Visibility"** section with radio buttons or dropdown

---

### Issue 3: Using Mobile App

The mobile app might have limited options. Try these:
1. Use desktop browser instead
2. Or on mobile: Event → Edit → Look for "Visibility" or "Privacy" options

---

### Issue 4: Google Calendar Workspace Restrictions

If using Google Workspace (work/school account), your admin might have disabled private events.

**Check:**
- Are you using a personal Gmail account (e.g., @gmail.com)?
- Or a work/school account (e.g., @company.com)?

If Workspace, your admin might need to enable this feature.

---

### Issue 5: Event Already Marked Private (But API Can't See It)

**Possible causes:**
1. **Insufficient permissions:** Service account needs "See all event details" not just "See only free/busy"
2. **Calendar not shared properly:** Double-check sharing settings

**Verify calendar sharing:**
1. Go to Google Calendar
2. Find your calendar (rashad.barnett@gmail.com) in the left sidebar
3. Click three dots → "Settings and sharing"
4. Scroll to "Share with specific people or groups"
5. Find your service account email
6. Make sure permission is **"See all event details"** NOT "See only free/busy (hide details)"

---

## Step-by-Step: Create A NEW Private Event (Test)

Let's create a completely new event to test:

1. Go to [Google Calendar](https://calendar.google.com)
2. Click **+ Create** button (top left)
3. Title: **"TEST PRIVATE EVENT"**
4. Date: Pick tomorrow's date
5. Click **"More options"** (important!)
6. You should now see a longer form
7. **SCROLL DOWN** past:
   - Title
   - Date/Time
   - Guests
   - Location
   - Description
8. Look for one of these:
   - **"Default visibility"** dropdown
   - **"Visibility"** section with radio buttons (Public/Private/Default)
   - A privacy icon (lock/eye symbol)
9. Select **"Private"** or click the lock icon
10. Click **"Save"**
11. Wait 30-60 seconds for Google to sync
12. Run: `curl -s http://localhost:3000/api/calendar/check-private | python3 -m json.tool`
13. Check if private count increased

---

## Alternative: Using Event Details Page

1. Open Google Calendar
2. Click on an existing event
3. In the popup, click the **event title** (not the pencil)
4. This opens event details in a side panel
5. Look for visibility/privacy options here
6. Some interfaces have it in this view instead

---

## What "Visibility: Private" Looks Like

When correctly set, you should see in the API response:

```json
{
  "summary": "Your Event",
  "visibility": "private",  ← This exact string
  "start": "2025-12-26"
}
```

**Currently seeing:**
- No "visibility" field = default
- "visibility": "public" = public
- "visibility": null = default

---

## Nuclear Option: Create Event via API

If the UI is confusing, we can create a test event directly via API:

```bash
# This will create a private event programmatically
curl http://localhost:3000/api/calendar/create-test-private-event
```

Would you like me to create this endpoint?

---

## What To Do Next

1. **Take a screenshot** of your Google Calendar event edit page
   - Show me where you're looking for the visibility setting
   - This will help me identify if you're in the right place

2. **Try creating a brand new event** (not editing existing)
   - Sometimes new events are easier to configure

3. **Check which Google Calendar interface you're using**
   - New interface (blue/modern)
   - Old interface (more gray/classic)

4. **Verify calendar sharing permissions again**
   - Make sure service account has "See all event details" permission
