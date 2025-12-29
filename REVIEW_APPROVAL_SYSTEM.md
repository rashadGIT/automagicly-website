# Review Approval System - Setup Guide

## Overview

I've created a complete review management system with:
1. **Admin Dashboard** - Approve/reject reviews
2. **API Routes** - Manage review data
3. **Integration ready** - Works with n8n or a database

---

## Quick Access

### Admin Dashboard
**URL:** http://localhost:3000/admin/reviews

**Default Password:** `admin123` (change this!)

---

## Features

### Admin Dashboard (`/admin/reviews`)
- ✅ View all reviews (pending, approved, rejected)
- ✅ Filter by status
- ✅ Approve/Reject reviews with one click
- ✅ Delete reviews
- ✅ See submitter details (name, email, company)
- ✅ Password protected

### Review Submission
- Users submit reviews via the website form
- Reviews start as "pending"
- Reviews are sent to your n8n webhook
- You approve/reject them in the admin dashboard
- Approved reviews appear on the public website

---

## Setup Options

You have **3 options** for storing reviews:

### Option 1: Use N8N (Recommended for you)

Since you're already using n8n, this is the easiest option!

#### Step 1: Update N8N Workflow

1. Open your n8n reviews webhook workflow
2. Add a **Database node** (or Google Sheets, Airtable, etc.)
3. Configure it to store reviews with these fields:
   ```
   - id (auto-generated)
   - name
   - email (NEW!)
   - company
   - rating
   - reviewText
   - serviceType
   - status (default: "pending")
   - submittedAt (timestamp)
   ```

#### Step 2: Create N8N Webhook for Admin API

Create 3 new webhook endpoints in n8n:

**Webhook 1: Get Reviews**
- Method: GET
- URL: `/webhook/reviews/list`
- Action: Query database and return all reviews (or filter by status)

**Webhook 2: Update Review Status**
- Method: POST
- URL: `/webhook/reviews/update`
- Action: Update review status in database (approved/rejected)

**Webhook 3: Delete Review**
- Method: POST
- URL: `/webhook/reviews/delete`
- Action: Delete review from database

#### Step 3: Update .env.local

Add these to your `.env.local`:

```bash
# Admin password (change this!)
ADMIN_PASSWORD=your-secure-password-here

# N8N Review Management Webhooks (Server-only)
N8N_REVIEWS_GET_URL=https://your-n8n.app.n8n.cloud/webhook/reviews/list
N8N_REVIEWS_UPDATE_URL=https://your-n8n.app.n8n.cloud/webhook/reviews/update
N8N_REVIEWS_DELETE_URL=https://your-n8n.app.n8n.cloud/webhook/reviews/delete
```

#### Step 4: Update API Route

Modify `/app/api/reviews/route.ts` to call your n8n webhooks instead of using in-memory storage.

---

### Option 2: Use a Simple JSON File (Quick Start)

For testing, you can store reviews in a JSON file:

1. Create `data/reviews.json` in your project root
2. Update the API route to read/write to this file
3. **Warning:** Not recommended for production (file locking issues)

---

### Option 3: Use a Database (Production)

For production, use a proper database:
- PostgreSQL (recommended)
- MySQL
- MongoDB
- Supabase (easiest)

---

## How to Use the Admin Dashboard

### Step 1: Access Admin Page

1. Go to: http://localhost:3000/admin/reviews
2. Enter password: `admin123` (or your custom password)
3. Click "Login"

### Step 2: Review Submissions

You'll see all pending reviews with:
- Reviewer name/email/company
- Star rating
- Review text
- Service type
- Submission date

### Step 3: Approve or Reject

For each review:
- Click **"✓ Approve"** to make it public
- Click **"✗ Reject"** to hide it
- Click **"🗑️ Delete"** to remove permanently

### Step 4: View Approved Reviews

- Click the **"Approved"** tab to see all approved reviews
- These will appear on your public website

---

## Update Reviews Component to Show Approved Reviews

Currently, the public Reviews component shows an empty state. Let's update it to fetch approved reviews:

### Update `components/Reviews.tsx`

Add this code at the top of the component:

```typescript
const [approvedReviews, setApprovedReviews] = useState<ReviewFormData[]>([]);

useEffect(() => {
  // Fetch approved reviews
  fetch('/api/reviews?status=approved')
    .then(res => res.json())
    .then(data => setApprovedReviews(data.reviews || []))
    .catch(err => console.error('Error loading reviews:', err));
}, []);
```

Then replace the empty approved reviews section with actual reviews.

---

## Security Recommendations

### 1. Change Default Password

Update `.env.local`:
```bash
ADMIN_PASSWORD=your-very-secure-password-123!
```

Update `/app/admin/reviews/page.tsx` line 30:
```typescript
if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
```

**Note:** For production, use proper authentication (NextAuth.js, Clerk, etc.)

### 2. Add IP Restriction (Optional)

Only allow admin access from your IP address.

### 3. Add Rate Limiting

Prevent spam submissions on the review form.

---

## N8N Workflow Example

Here's a simple n8n workflow structure for review management:

### Workflow: "Review Submission"
```
Webhook (review form)
  ↓
Set Default Status (pending)
  ↓
Google Sheets (add row)
  ↓
Send Email Notification (to you)
  ↓
Return Success
```

### Workflow: "Get Reviews"
```
Webhook (/reviews/list)
  ↓
Get Query Params (status filter)
  ↓
Google Sheets (query rows)
  ↓
Filter by status (if specified)
  ↓
Return JSON
```

### Workflow: "Update Review Status"
```
Webhook (/reviews/update)
  ↓
Get Body (id, status)
  ↓
Google Sheets (update row)
  ↓
If status = "approved"
    ↓
    Send Email (thank reviewer)
  ↓
Return Success
```

---

## Testing the System

### Test Review Submission

1. Go to your website reviews section
2. Click "Submit a Review"
3. Fill out the form (including email now!)
4. Submit

### Test Admin Dashboard

1. Go to http://localhost:3000/admin/reviews
2. Login with password
3. You should see the review in "Pending" status
4. Click "Approve"
5. Switch to "Approved" tab
6. Review should appear there

### Test Public Display

1. Go back to main website
2. Scroll to Reviews section
3. Approved review should appear (after you update the component)

---

## Next Steps

1. **Choose storage option** (n8n recommended)
2. **Update .env.local** with admin password
3. **Test review submission**
4. **Test admin approval**
5. **Update Reviews component** to display approved reviews

---

## File Locations

- **Admin Dashboard:** `/app/admin/reviews/page.tsx`
- **API Routes:** `/app/api/reviews/route.ts`
- **Review Form:** `/components/Reviews.tsx`
- **Types:** `/lib/types.ts`

---

## Support

If you want me to:
- Set up the n8n integration
- Create the database schema
- Add proper authentication
- Update the Reviews component to show approved reviews

Just let me know! 🚀
