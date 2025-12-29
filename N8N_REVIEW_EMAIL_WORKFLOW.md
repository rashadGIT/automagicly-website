# N8N Review Email Workflow - Complete Setup Guide

## Overview

This workflow sends you email notifications when users submit reviews, with one-click approve/reject buttons.

---

## Workflow Architecture

```
User Submits Review (Website)
        ↓
Reviews API (/api/reviews)
        ↓
Generates Approval Token
        ↓
Sends to N8N Webhook
        ↓
N8N Workflow (you build this)
        ↓
Sends Email with Action Buttons
        ↓
You Click [Approve] or [Reject]
        ↓
Opens: /api/reviews/approve?token=xxx
        ↓
Updates Database
        ↓
Review appears on website!
```

---

## Step 1: Update Your Reviews Webhook

### Current Setup
Your review form currently sends to:
```
https://rashadbarnett.app.n8n.cloud/webhook-test/reviews
```

### What You Need to Add

The API now sends additional data for email notifications:

```json
{
  // Review data
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "rating": 5,
  "reviewText": "Great service!",
  "serviceType": "AI Audit",

  // NEW: Approval token data
  "approvalToken": "review_1234567890_abc123xyz",
  "tokenExpiresAt": "2025-01-03T12:00:00.000Z",

  // NEW: Email action URLs
  "emailData": {
    "approveUrl": "https://automagicly.com/api/reviews/approve?token=xxx",
    "rejectUrl": "https://automagicly.com/api/reviews/reject?token=xxx",
    "adminUrl": "https://automagicly.com/admin/reviews"
  }
}
```

---

## Step 2: Create N8N Workflow

### Workflow Name: "Review Email Notification"

### Nodes You Need:

1. **Webhook Trigger**
2. **Set Variables** (optional - clean up data)
3. **Send Email** (Gmail, SendGrid, or other)
4. **Respond to Webhook**

---

## Step 3: Configure Each Node

### Node 1: Webhook Trigger

**Settings:**
- Path: `/webhook/reviews` (or your custom path)
- Method: POST
- Response Mode: When Last Node Finishes
- Authentication: None (or add if you want)

**Test:** After creating, n8n gives you a webhook URL like:
```
https://rashadbarnett.app.n8n.cloud/webhook/reviews
```

Update your `.env.local`:
```bash
NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook/reviews
```

---

### Node 2: Set Variables (Optional)

This makes the email template cleaner.

**Settings:**
- Add these values:
  - `reviewerName`: `{{ $json.body.name || 'Anonymous' }}`
  - `reviewerEmail`: `{{ $json.body.email || 'Not provided' }}`
  - `reviewerCompany`: `{{ $json.body.company || 'Not provided' }}`
  - `rating`: `{{ $json.body.rating }}`
  - `reviewText`: `{{ $json.body.reviewText }}`
  - `serviceType`: `{{ $json.body.serviceType }}`
  - `approveUrl`: `{{ $json.body.emailData.approveUrl }}`
  - `rejectUrl`: `{{ $json.body.emailData.rejectUrl }}`
  - `adminUrl`: `{{ $json.body.emailData.adminUrl }}`

---

### Node 3: Send Email (Gmail Example)

**Settings:**
- To: `your-email@example.com` (your email)
- Subject: `⭐ New {{ $json.rating }}-Star Review from {{ $json.body.name }}`
- Email Type: HTML
- Body: Use the HTML template below

---

## Email HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .review-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .stars { color: #fbbf24; font-size: 24px; }
    .actions { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; padding: 15px 30px; margin: 0 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
    .btn-approve { background: #10b981; color: white; }
    .btn-reject { background: #ef4444; color: white; }
    .btn-admin { background: #6b7280; color: white; }
    .info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✨ New Review Submitted</h1>
    </div>

    <div class="content">
      <p><strong>A new review has been submitted and is awaiting your approval.</strong></p>

      <div class="info">
        <p><strong>From:</strong> {{ $json.body.name || 'Anonymous' }}</p>
        <p><strong>Email:</strong> {{ $json.body.email || 'Not provided' }}</p>
        <p><strong>Company:</strong> {{ $json.body.company || 'Not provided' }}</p>
        <p><strong>Service:</strong> {{ $json.body.serviceType }}</p>
      </div>

      <div class="review-box">
        <div class="stars">
          {{ '★'.repeat($json.body.rating) }}{{ '☆'.repeat(5 - $json.body.rating) }}
        </div>
        <p style="margin-top: 15px; font-size: 16px; font-style: italic;">
          "{{ $json.body.reviewText }}"
        </p>
      </div>

      <div class="actions">
        <a href="{{ $json.body.emailData.approveUrl }}" class="btn btn-approve">
          ✓ Approve Review
        </a>
        <a href="{{ $json.body.emailData.rejectUrl }}" class="btn btn-reject">
          ✗ Reject Review
        </a>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="{{ $json.body.emailData.adminUrl }}" class="btn btn-admin">
          📊 View All Reviews
        </a>
      </div>

      <div class="footer">
        <p>This approval link expires in 7 days for security.</p>
        <p>AutoMagicly Review System</p>
      </div>
    </div>
  </div>
</body>
</html>
```

**N8N Expression Version:**

In n8n, use this in the HTML field:

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">✨ New Review Submitted</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #374151;"><strong>A new review is awaiting your approval.</strong></p>

      <!-- Reviewer Info -->
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0; color: #4b5563;"><strong>From:</strong> {{ $json.body.name || 'Anonymous' }}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Email:</strong> {{ $json.body.email || 'Not provided' }}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Company:</strong> {{ $json.body.company || 'Not provided' }}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Service:</strong> {{ $json.body.serviceType }}</p>
      </div>

      <!-- Review -->
      <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
        <div style="color: #fbbf24; font-size: 24px; margin-bottom: 10px;">
          ★★★★★ ({{ $json.body.rating }}/5)
        </div>
        <p style="font-size: 16px; font-style: italic; color: #374151; line-height: 1.6;">
          "{{ $json.body.reviewText }}"
        </p>
      </div>

      <!-- Action Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $json.body.emailData.approveUrl }}" style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; margin: 0 5px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          ✓ Approve Review
        </a>
        <a href="{{ $json.body.emailData.rejectUrl }}" style="display: inline-block; background: #ef4444; color: white; padding: 15px 30px; margin: 0 5px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          ✗ Reject Review
        </a>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <a href="{{ $json.body.emailData.adminUrl }}" style="display: inline-block; background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
          📊 View All Reviews in Dashboard
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p>This approval link expires in 7 days for security.</p>
        <p>AutoMagicly Review System • Powered by N8N</p>
      </div>
    </div>
  </div>
</body>
</html>
```

---

### Node 4: Respond to Webhook

**Settings:**
- Response Code: 200
- Body:
```json
{
  "success": true,
  "message": "Review submitted and notification sent"
}
```

---

## Step 4: Alternative Email Providers

### Using SendGrid

1. Add **SendGrid** node after webhook
2. Set API key in n8n credentials
3. Configure:
   - From: your-verified-sender@domain.com
   - To: your-email@example.com
   - Subject: Same as above
   - HTML: Same template

### Using Gmail

1. Add **Gmail** node
2. Connect your Gmail account (OAuth)
3. Configure same as above

### Using SMTP

1. Add **Send Email (SMTP)** node
2. Configure SMTP settings
3. Use same template

---

## Step 5: Test the Workflow

### Test from Website

1. Go to your website
2. Submit a test review
3. Check your email inbox
4. You should receive the email with action buttons

### Test Approval Flow

1. Click **[✓ Approve Review]** in the email
2. You'll see a success page
3. Go to http://localhost:3000/admin/reviews
4. Review should be marked as "approved"
5. Check your public website - review should appear!

### Test Rejection Flow

1. Submit another test review
2. Click **[✗ Reject Review]** in the email
3. Review should be marked as "rejected"
4. Won't appear on public website

---

## Step 6: Advanced Features (Optional)

### Auto-Approve 5-Star Reviews

Add an **IF** node after the webhook:

```
IF: {{ $json.body.rating === 5 }}
  TRUE → Auto-approve (update database)
  FALSE → Send email notification
```

### Slack Notification

Add a **Slack** node to also notify your team:

```
Message: New {{ $json.body.rating }}-star review from {{ $json.body.name }}
```

### Save to Google Sheets

Add **Google Sheets** node to log all reviews:

```
Sheet: Reviews
Columns: Name, Email, Company, Rating, Review Text, Status, Date
```

---

## Troubleshooting

### Email Not Sending

**Check:**
1. n8n workflow is activated ✅
2. Email node credentials are valid
3. Check n8n execution logs
4. Verify email provider settings

### Approval Links Not Working

**Check:**
1. Token is included in URL
2. Website is accessible
3. Check browser console for errors
4. Verify API route is working: `/api/reviews/approve`

### Reviews Not Appearing

**Check:**
1. Review status is "approved"
2. Database is saving correctly
3. Frontend is fetching from API
4. Check `/api/reviews?status=approved`

---

## Security Notes

### Token Expiration

- Tokens expire after 7 days
- One-time use only (should be cleared after use)
- Random and unpredictable

### Email Link Protection

- Don't forward approval emails
- Links are tied to specific reviews
- Can be revoked in admin dashboard

### Production Best Practices

1. Use environment variables for all URLs
2. Enable HTTPS for all endpoints
3. Add rate limiting to prevent spam
4. Monitor for unusual activity
5. Regular database backups

---

## Complete N8N Workflow JSON

Here's the exportable workflow (import this into n8n):

```json
{
  "name": "Review Email Notification",
  "nodes": [
    {
      "parameters": {
        "path": "reviews",
        "method": "POST"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "sendTo": "your-email@gmail.com",
        "subject": "=⭐ New {{$json.body.rating}}-Star Review from {{$json.body.name}}",
        "emailFormat": "html",
        "message": "=<!DOCTYPE html>... (use template above)"
      },
      "name": "Gmail",
      "type": "n8n-nodes-base.gmail",
      "credentials": { "gmailOAuth2": "Gmail account" },
      "position": [450, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseCode": 200,
        "responseBody": {
          "success": true,
          "message": "Review submitted"
        }
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Gmail", "type": "main", "index": 0 }]]
    },
    "Gmail": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## Summary

You now have a complete hybrid review system:

✅ **Email notifications** when reviews are submitted
✅ **One-click approval/rejection** from email
✅ **Admin dashboard** for full management
✅ **Featured reviews** system
✅ **Rotating display** on website
✅ **Secure token-based** approvals

**Next Steps:**
1. Set up the n8n workflow
2. Test with a review submission
3. Approve/reject via email
4. Feature your best reviews
5. Watch them appear on your website!

Need help? Check the detailed guides:
- `REVIEW_APPROVAL_SYSTEM.md` - Admin dashboard guide
- `REVIEW_WORKFLOW_COMPARISON.md` - Why hybrid is best

🚀 Your review system is ready!
