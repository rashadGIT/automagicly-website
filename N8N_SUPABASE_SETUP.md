# N8N + Supabase Integration Guide

## Prerequisites

✅ Supabase project created (from SUPABASE_SETUP_GUIDE.md)
✅ Database table created
✅ npm install @supabase/supabase-js completed

---

## Step 1: Add Environment Variables to N8N

### 1. Go to N8N Settings
1. Open https://rashadbarnett.app.n8n.cloud
2. Click **Settings** (bottom left)
3. Click **Environment Variables**

### 2. Add These Variables

```
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
WEBSITE_URL=http://localhost:3000
```

**Note:** In production, change `WEBSITE_URL` to your actual domain.

---

## Step 2: Import N8N Workflow

### Option A: Import from File

1. Download `n8n-supabase-review-workflow.json`
2. In N8N, click **"+"** → **"Import from File"**
3. Upload the file
4. Click **"Import"**

### Option B: Copy-Paste JSON

1. In N8N, click **"+"** → **"Import from File"**
2. Copy the JSON from `n8n-supabase-review-workflow.json`
3. Paste and import

---

## Step 3: Configure Gmail Node

1. Click the **"Send Email Notification"** node
2. **Change email** from `rashad.barnett@gmail.com` to YOUR email
3. Click **"Create New Credential"** for Gmail
4. Connect your Gmail account

---

## Step 4: Get Webhook URL

1. Click the **"Review Submitted"** node
2. Click **"Listen for Test Event"**
3. Copy the **Production URL**:
   ```
   https://rashadbarnett.app.n8n.cloud/webhook/reviews
   ```

---

## Step 5: Update Your .env.local

Add/update this in your `.env.local`:

```bash
# N8N Webhook (updated for Supabase)
NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook/reviews
```

---

## Step 6: Activate Workflow

1. Toggle the switch at top: **"Inactive"** → **"Active"**
2. ✅ Workflow is live!

---

## How It Works

### Review Submission Flow:

```
1. User submits review on website
   ↓
2. Website sends to N8N webhook
   ↓
3. N8N inserts into Supabase (status: pending)
   ↓
4. Supabase returns the inserted review (with ID)
   ↓
5. N8N sends you email with approval buttons
   ↓
6. N8N responds to website "success"
```

### Email Approval Flow:

```
1. You click [Approve] in email
   ↓
2. Opens: yoursite.com/api/reviews/approve?token=xxx
   ↓
3. API validates token in Supabase
   ↓
4. Updates status to 'approved'
   ↓
5. Shows success page
   ↓
6. Review appears on website (3+ stars only)
```

---

## Testing the Workflow

### Test 1: Submit a Review

1. Go to your website
2. Click "Submit a Review"
3. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Company: Test Co
   - Rating: 5 stars
   - Review: "This is a test review!"
   - Service: AI Audit
4. Click **"Submit Review"**

### Test 2: Check N8N Execution

1. Go to N8N → **Executions** (left sidebar)
2. You should see a successful execution
3. Click on it to see details:
   - ✅ Webhook received data
   - ✅ Inserted into Supabase
   - ✅ Email sent
   - ✅ Responded to website

### Test 3: Check Supabase

1. Go to Supabase → **Table Editor** → **reviews**
2. You should see your test review:
   - status: pending
   - rating: 5
   - Has approval_token

### Test 4: Check Your Email

1. Check your inbox
2. You should have an email with:
   - Subject: "⭐⭐⭐⭐⭐ New Review from Test User"
   - Beautiful HTML layout
   - [Approve] and [Reject] buttons

### Test 5: Approve Review

1. Click **[✓ Approve Review]** in email
2. You should see a success page
3. Check Supabase:
   - status should now be 'approved'
   - approved_at timestamp set

---

## Workflow Nodes Explained

### Node 1: Review Submitted (Webhook)
- **Type:** Webhook Trigger
- **Path:** `/reviews`
- **Receives:** Review data from website

### Node 2: Insert to Supabase (HTTP Request)
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `{SUPABASE_URL}/rest/v1/reviews`
- **Headers:**
  - apikey: Your service key
  - Authorization: Bearer token
  - Prefer: return=representation (returns inserted data)
- **Body:** Review data + approval token
- **Returns:** Complete review with ID

### Node 3: Send Email Notification (Gmail)
- **Type:** Gmail
- **To:** Your email
- **Subject:** Dynamic (includes rating stars)
- **Body:** HTML template with approval buttons

### Node 4: Respond Success (Respond to Webhook)
- **Type:** Respond to Webhook
- **Code:** 200
- **Body:** Success message with review ID

---

## Advanced: Auto-Approve 5-Star Reviews

Add an **IF** node after "Insert to Supabase":

### IF Node Configuration:
```
Condition:
{{ $json[0].rating }} equals 5
```

### TRUE Branch: Auto-Approve
Add **HTTP Request** node:
- Method: PATCH
- URL: `{SUPABASE_URL}/rest/v1/reviews?id=eq.{{ $json[0].id }}`
- Body: `{ "status": "approved", "approved_at": "{{ new Date().toISOString() }}" }`

### FALSE Branch: Send Email
Connect to existing "Send Email Notification"

This automatically approves 5-star reviews without your manual approval!

---

## Environment Variables Reference

### In N8N:
```
SUPABASE_URL = Your Supabase project URL
SUPABASE_SERVICE_KEY = Your service role key (secret)
WEBSITE_URL = Your website URL (for email links)
```

### In Your .env.local:
```bash
# Supabase (for website API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# N8N Webhook
NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook/reviews
```

---

## Troubleshooting

### Email not sending?
- Check Gmail credential is connected
- Check email address is correct
- Check N8N execution logs for errors

### Not inserting to Supabase?
- Check SUPABASE_URL is correct
- Check SUPABASE_SERVICE_KEY is correct
- Check headers are set properly
- Look at execution logs for error message

### Website returns error?
- Check webhook URL is correct
- Check workflow is activated
- Check website .env.local is updated
- Restart dev server after changing .env

### Approval links don't work?
- Check WEBSITE_URL in N8N env vars
- Check token is being generated
- Check token is in Supabase

---

## Production Checklist

Before going live:

- [ ] Change WEBSITE_URL from localhost to your domain
- [ ] Update email address to your real email
- [ ] Test all flows end-to-end
- [ ] Set up Supabase production database
- [ ] Enable Supabase backups
- [ ] Monitor N8N execution limits
- [ ] Add error handling notifications

---

## Cost Breakdown

### N8N Cloud (Free Tier):
- ✅ 5,000 workflow executions/month
- ✅ 20 active workflows
- ✅ More than enough for reviews!

### Supabase (Free Tier):
- ✅ 500 MB database (thousands of reviews)
- ✅ Unlimited API requests
- ✅ Automatic backups

**Total cost: $0/month** for small-medium traffic! 🎉

---

## Next Steps

Once workflow is working:

1. ✅ Update API routes to query Supabase
2. ✅ Update Reviews component to fetch from Supabase
3. ✅ Update admin dashboard to use Supabase
4. ✅ Add 3+ star filter on public display

Let's do that next! 🚀
