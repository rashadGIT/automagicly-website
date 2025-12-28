# EXACT Steps: How to Mark an Event as Private in Google Calendar

## The Problem
You're looking for the wrong setting or in the wrong place. Let me show you EXACTLY where it is.

---

## Desktop Web Browser (RECOMMENDED)

### Step 1: Open Google Calendar
Go to: https://calendar.google.com

### Step 2: Click on an Existing Event
- Click on one of your events (e.g., "Hjiofrengoirngioprneopgire")
- A popup will appear

### Step 3: Click "Edit" (Pencil Icon)
- In the popup, click the pencil/edit icon
- This opens the full event editor

### Step 4: Find "Default visibility" Dropdown
**This is the tricky part - it's usually hidden below!**

Scroll down past:
- [ ] Title field
- [ ] Date/Time
- [ ] Add guests
- [ ] Add location
- [ ] Add description
- [ ] Add conferencing
- [ ] Add notification

**Keep scrolling!** You should see:

```
┌─────────────────────────────────────┐
│ Default visibility          [▼]    │  ← THIS IS IT!
└─────────────────────────────────────┘
```

It will say one of:
- "Default visibility"
- "Public"
- "Private"

### Step 5: Click the Dropdown
Click on it and you'll see three options:
- **Default** - Uses your calendar's default setting
- **Public** - Anyone can see event details
- **Private** - Only you can see details (others see "Busy")

### Step 6: Select "Private"
Click on **"Private"**

### Step 7: Save
Click the **"Save"** button (top right)

### Step 8: Verify (Wait 30 seconds for sync)
```bash
curl -s http://localhost:3000/api/calendar/raw-events | python3 -m json.tool | grep -B 2 -A 5 "visibility"
```

You should see:
```json
"visibility": "private"
```

---

## If You Don't See "Default visibility" Dropdown

### Option A: You're Creating a New Event
When **creating** a new event (not editing):
1. Click "+ Create"
2. Fill in basic details
3. Click **"More options"** button
4. This opens the full form where you'll find the visibility dropdown

### Option B: Different Calendar Interface
Google has multiple interfaces. Try:

**Method 1: Right-click method**
1. Right-click on the event
2. Select "Edit event"
3. Look for visibility options

**Method 2: Event details page**
1. Click event title (not the popup)
2. Opens a side panel
3. Look for privacy/visibility icon or dropdown

**Method 3: Old calendar interface**
If you're on the old interface, you might see:
- Radio buttons instead of dropdown
- A "Visibility" section with options

---

## What It Looks Like When Set Correctly

After setting to private, the event in Google Calendar might show:
- A small lock icon 🔒
- Gray background (in some views)
- "Private" label

---

## Create a NEW Private Event (Easiest Test)

Instead of editing, create a fresh one:

1. Go to Google Calendar
2. Click **+ Create**
3. Title: **"DELETE ME - Testing Private"**
4. Pick tomorrow's date
5. Click **"More options"**
6. Scroll down to **"Default visibility"**
7. Select **"Private"**
8. Click **Save**

Then check:
```bash
curl -s http://localhost:3000/api/calendar/check-private | python3 -m json.tool
```

Should show:
```json
"private": 1  ← This should increment!
```

---

## Still Can't Find It?

### Take a Screenshot
1. Open Google Calendar in your browser
2. Edit one of your events
3. Scroll through the ENTIRE form
4. Take screenshots of ALL the fields you see
5. Send them to me

### Or Try Mobile App
Sometimes mobile is different:
1. Open Google Calendar app
2. Tap event
3. Tap "Edit"
4. Look for "Visibility" or privacy toggle

---

## Common Mistakes

❌ **Going to Calendar Settings** → This changes the whole calendar, not individual events
❌ **Looking in "Settings and sharing"** → This is for calendar sharing, not event privacy
❌ **Changing "Make available to" dropdown** → This is about free/busy, not privacy
✅ **Finding "Default visibility" dropdown in EVENT editor** → This is correct!

---

## Verification Checklist

After changing to private:
- [ ] I clicked on a specific event (not calendar settings)
- [ ] I clicked "Edit" to open the event editor
- [ ] I scrolled down past description field
- [ ] I found a dropdown that says "Default visibility" or similar
- [ ] I selected "Private" from the dropdown
- [ ] I clicked "Save"
- [ ] I waited 30-60 seconds
- [ ] I ran the check command
- [ ] Private count increased to 1 or more

---

## Last Resort: Let Me Create One For You

If you absolutely can't find the setting, I can try to create a private event via API:

```bash
curl -X POST http://localhost:3000/api/calendar/create-test-private
```

**Note:** This might fail if your service account only has read permission (which is common for security). But it's worth trying!
