# N8N Timezone Handling for Booking System

## Updated Booking Data Format

The booking form now sends **three** datetime fields to your n8n webhook:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "notes": "...",
  "time": "09:00",
  "date": "2025-12-27",

  // NEW: Human-readable format with timezone
  "dateTime": "2025-12-27 09:00 America/New_York",

  // NEW: ISO format with proper timezone offset (USE THIS FOR GOOGLE CALENDAR!)
  "dateTimeISO": "2025-12-27T14:00:00.000Z",

  // User's timezone name
  "timezone": "America/New_York",

  "type": "AI Audit Booking"
}
```

---

## How to Use in N8N

### Option 1: Use `dateTimeISO` (RECOMMENDED)

The `dateTimeISO` field is already in ISO 8601 format with timezone, which Google Calendar understands perfectly.

**In your n8n Google Calendar node:**

1. Click on the **Google Calendar** node
2. Set **Start Time** to: `{{ $json.dateTimeISO }}`
3. Set **End Time** to: `{{ new Date(new Date($json.dateTimeISO).getTime() + 60*60*1000).toISOString() }}`
   - This adds 1 hour for a 1-hour meeting
   - Adjust the `60*60*1000` to change meeting duration

**Result:** The event will be created at the correct time in both the user's timezone AND your CST timezone.

---

### Option 2: Convert in N8N

If you prefer to work with the separate fields:

1. Add a **Function** node before Google Calendar
2. Use this code:

```javascript
// Get the booking data
const bookingData = $input.item.json;

// Parse the date and time in the user's timezone
const dateStr = bookingData.date;
const timeStr = bookingData.time;
const timezone = bookingData.timezone;

// Create datetime string
const dateTimeStr = `${dateStr}T${timeStr}:00`;

// Convert to Date object (will be in user's timezone)
const dateTime = new Date(dateTimeStr);

// Create end time (1 hour later)
const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000);

return {
  ...bookingData,
  startTimeISO: dateTime.toISOString(),
  endTimeISO: endTime.toISOString()
};
```

3. Then in Google Calendar node:
   - Start Time: `{{ $json.startTimeISO }}`
   - End Time: `{{ $json.endTimeISO }}`

---

## Example Scenarios

### Scenario 1: User in EST selects 9:00 AM

**User sees:**
- "9:00 AM EST" in the booking form

**Data sent to n8n:**
```json
{
  "dateTime": "2025-12-27 09:00 America/New_York",
  "dateTimeISO": "2025-12-27T14:00:00.000Z",  // 9am EST = 2pm UTC
  "timezone": "America/New_York"
}
```

**Google Calendar shows:**
- For user in EST: 9:00 AM
- For you in CST: 8:00 AM ✅ Correct!

---

### Scenario 2: User in PST selects 9:00 AM

**User sees:**
- "9:00 AM PST" in the booking form

**Data sent to n8n:**
```json
{
  "dateTime": "2025-12-27 09:00 America/Los_Angeles",
  "dateTimeISO": "2025-12-27T17:00:00.000Z",  // 9am PST = 5pm UTC
  "timezone": "America/Los_Angeles"
}
```

**Google Calendar shows:**
- For user in PST: 9:00 AM
- For you in CST: 11:00 AM ✅ Correct!

---

## Testing the Fix

### Step 1: Test Booking Form

1. Open your booking form
2. Select a date and time
3. You should see: **"Your timezone: America/Chicago"** (or your actual timezone)
4. Submit the booking

### Step 2: Check n8n Webhook

1. Go to your n8n workflow
2. Click on the webhook node
3. View the executions
4. Check that you receive the `dateTimeISO` field

### Step 3: Verify Google Calendar

1. After creating the booking
2. Check Google Calendar
3. The event should show at the correct time in YOUR timezone (CST)

---

## Common Timezone Abbreviations

- **EST** = Eastern Standard Time (UTC-5)
- **EDT** = Eastern Daylight Time (UTC-4)
- **CST** = Central Standard Time (UTC-6)  ← Your timezone
- **CDT** = Central Daylight Time (UTC-5)
- **MST** = Mountain Standard Time (UTC-7)
- **PST** = Pacific Standard Time (UTC-8)
- **UTC** = Coordinated Universal Time (UTC+0)

---

## Troubleshooting

### Issue: Times still off by 1 hour

**Check:**
1. Is your n8n using `dateTimeISO` field?
2. Is Google Calendar node set to use ISO format?
3. Clear any hardcoded timezone conversions in n8n

### Issue: Daylight Saving Time problems

**Solution:** The `dateTimeISO` format automatically handles DST because it uses UTC offsets, not timezone names.

### Issue: Want to force all bookings to CST

If you want users to see times in CST regardless of their timezone:

1. Update the `TIME_SLOTS` array in `CustomBooking.tsx`
2. Add a note: "All times shown in Central Time (CST)"
3. In the submission handler, force timezone to `America/Chicago`

---

## Summary

✅ **Before (broken):**
- Sent: `"dateTime": "2025-12-27 09:00"`
- Google Calendar guessed the timezone
- Result: Wrong time

✅ **After (fixed):**
- Sent: `"dateTimeISO": "2025-12-27T14:00:00.000Z"`
- Google Calendar knows exact moment in time
- Result: Correct time in all timezones!

---

## Your N8N Workflow Update

**Quick Update:**

1. Open your n8n workflow
2. Find the **Google Calendar** node
3. Change **Start Time** field from:
   - ❌ `{{ $json.dateTime }}`
   - ✅ `{{ $json.dateTimeISO }}`
4. Change **End Time** field to:
   - ✅ `{{ new Date(new Date($json.dateTimeISO).getTime() + 60*60*1000).toISOString() }}`
5. Save and test!

That's it! 🎉
