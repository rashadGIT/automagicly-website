# How to Create PRIVATE Events in Google Calendar

## The Issue
Your events are NOT marked as "private" in Google Calendar. The API shows:
- 0 private events
- Event "App Phase 1" = default visibility
- Event "Hjiofrengoirngioprneopgire" = public visibility

## How to Make Events Private (Step-by-Step)

### Option 1: Create New Private Event

1. Go to [Google Calendar](https://calendar.google.com)
2. Click **+ Create** (or click on a date/time)
3. Add event details (title, date, time)
4. Click **More options**
5. **SCROLL DOWN** to find the **"Visibility"** section
6. Click the dropdown that says "Default visibility"
7. Select **"Private"** (or "Only me" in some interfaces)
8. Click **Save**

### Option 2: Change Existing Events to Private

1. Go to [Google Calendar](https://calendar.google.com)
2. Click on an existing event
3. Click the **pencil icon** (Edit event)
4. **SCROLL DOWN** to the **"Visibility"** section
5. Change from "Default" or "Public" to **"Private"**
6. Click **Save**

## What "Private" Means

When you set an event to "Private":
- ✅ The service account CAN still see it
- ✅ It WILL be blocked in the booking calendar
- ℹ️ Other people who can see your calendar will only see "Busy" (no event details)

## Verify It Worked

After creating/editing an event to be private:

1. Wait 30 seconds for Google to sync
2. Visit: http://localhost:3000/api/calendar/raw-events
3. Look for `"visibility": "private"` in the response

You should see something like:
```json
{
  "summary": "Your Private Event",
  "visibility": "private",  ← THIS IS KEY!
  "start": "2026-01-10"
}
```

## Quick Test Commands

```bash
# Check raw event data
curl -s http://localhost:3000/api/calendar/raw-events | python3 -m json.tool | grep -A 2 visibility

# Check private event count
curl -s http://localhost:3000/api/calendar/check-private | python3 -m json.tool | grep -A 5 privateEventStats
```

## Common Mistakes

❌ **Setting calendar to "Private"** - This makes the whole calendar private, not individual events
✅ **Setting individual events to "Private"** - This is what we need!

❌ **Checking "Private event" during creation** - This might be a different setting
✅ **Using the "Visibility" dropdown and selecting "Private"** - Correct!

## Expected Behavior

Once you have private events:
1. They appear in your booking calendar as BLOCKED/BUSY dates
2. The API returns them with `"visibility": "private"`
3. The `/api/calendar/availability` endpoint includes those dates
4. The booking form prevents users from selecting those dates

## Still Not Working?

If you've set events to private and they still don't show up:
1. Check you're using the correct calendar (rashad.barnett@gmail.com)
2. Verify events are in the next 90 days
3. Refresh your browser
4. Check the browser console for errors
5. Try the raw-events endpoint to see the actual visibility value
