# n8n Workflows Setup Checklist

Use this checklist to set up all your n8n workflows quickly.

## ✅ Pre-Setup

- [ ] Have n8n instance running (cloud or self-hosted)
- [ ] Have access to n8n admin panel
- [ ] Have Google account for Calendar/Sheets/Gmail
- [ ] (Optional) Have Slack workspace
- [ ] (Optional) Have HubSpot account
- [ ] (Optional) Have OpenAI API key

---

## 📋 Step-by-Step Setup

### 1. Create Google Sheets (5 minutes)

Create one Google Sheet with multiple tabs:

**Sheet Name:** `AutoMagicly Data`

**Create these tabs:**
- [ ] Reviews
- [ ] Referrals
- [ ] Waitlist
- [ ] Chat

**Copy Sheet ID from URL:**
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```
Your Sheet ID: `_______________________________`

---

### 2. Set Up n8n Credentials (10 minutes)

Go to n8n → Settings → Credentials

**Create these credentials:**

- [ ] **Google Calendar OAuth2**
  - Name: `Google Calendar account`
  - Follow OAuth flow
  - Test connection

- [ ] **Google Sheets OAuth2**
  - Name: `Google Sheets account`
  - Follow OAuth flow
  - Test connection

- [ ] **Gmail OAuth2**
  - Name: `Gmail account`
  - Follow OAuth flow
  - Test connection

- [ ] **Slack API** (Optional)
  - Name: `Slack account`
  - Get token from: https://api.slack.com/apps
  - Test connection

- [ ] **HubSpot API** (Optional)
  - Name: `HubSpot account`
  - Get API key from HubSpot settings
  - Test connection

- [ ] **OpenAI API** (Optional - for chat)
  - Name: `OpenAI account`
  - Get key from: https://platform.openai.com/api-keys
  - Test connection

---

### 3. Import Workflows (15 minutes)

Import each workflow and configure:

#### A. Booking Workflow
- [ ] Import `booking-workflow.json`
- [ ] Update Google Sheet ID (if logging bookings)
- [ ] Customize email template (your branding)
- [ ] Update Slack channel or remove Slack node
- [ ] Remove HubSpot node if not using CRM
- [ ] **Activate workflow**
- [ ] Copy webhook URL: `_______________________________`

#### B. Reviews Workflow
- [ ] Import `reviews-workflow.json`
- [ ] Update Google Sheet ID to your sheet
- [ ] Customize thank you email template
- [ ] Add your Google Business review link
- [ ] Update Slack channel or remove node
- [ ] **Activate workflow**
- [ ] Copy webhook URL: `_______________________________`

#### C. Referrals Workflow
- [ ] Import `referrals-workflow.json`
- [ ] Update Google Sheet ID
- [ ] Customize referrer thank you email
- [ ] Customize introduction email to referral
- [ ] Set referral rewards ($100 / $500)
- [ ] Update Slack channel or remove node
- [ ] **Activate workflow**
- [ ] Copy webhook URL: `_______________________________`

#### D. Waitlist Workflow
- [ ] Import `waitlist-workflow.json`
- [ ] Update Google Sheet ID
- [ ] Customize confirmation email for each product
- [ ] Update Slack channel or remove node
- [ ] **Activate workflow**
- [ ] Copy webhook URL: `_______________________________`

#### E. Chat Workflow
- [ ] Import `chat-workflow.json`
- [ ] Update Google Sheet ID
- [ ] Configure OpenAI credentials
- [ ] Customize AI prompt/instructions
- [ ] Update Slack channel for urgent alerts
- [ ] **Activate workflow**
- [ ] Copy webhook URL: `_______________________________`

---

### 4. Update Website Environment Variables (5 minutes)

Edit `.env.local` in your project:

```bash
# Booking (replaces Calendly)
NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL=https://your-n8n.com/webhook/booking

# Reviews
NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL=https://your-n8n.com/webhook/reviews

# Referrals
NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL=https://your-n8n.com/webhook/referrals

# Waitlist
NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL=https://your-n8n.com/webhook/waitlist

# Chat (Server-side - no NEXT_PUBLIC_)
N8N_CHAT_WEBHOOK_URL=https://your-n8n.com/webhook/chat
```

**Checklist:**
- [ ] Created `.env.local` file
- [ ] Added all 5 webhook URLs
- [ ] Saved file
- [ ] Restarted dev server (`npm run dev`)

---

### 5. Test Each Workflow (20 minutes)

#### Test Booking:
- [ ] Visit http://localhost:3000/#booking
- [ ] Select date and time
- [ ] Fill in details (use your email)
- [ ] Submit booking
- [ ] **Verify:**
  - [ ] Calendar event created
  - [ ] Confirmation email received
  - [ ] Google Meet link works
  - [ ] Slack notification sent (if enabled)
  - [ ] CRM updated (if enabled)

#### Test Reviews:
- [ ] Visit http://localhost:3000/#reviews
- [ ] Submit 5-star review (use your email)
- [ ] **Verify:**
  - [ ] Saved to Google Sheets
  - [ ] Thank you email received
  - [ ] Slack notification sent
- [ ] Submit 2-star review
- [ ] **Verify:**
  - [ ] Alert email received
  - [ ] Marked in Slack as low rating

#### Test Referrals:
- [ ] Visit http://localhost:3000/#referrals
- [ ] Submit referral (use 2 different emails)
- [ ] **Verify:**
  - [ ] Saved to Google Sheets
  - [ ] Referrer got thank you email
  - [ ] Referral got introduction email
  - [ ] Slack notification sent

#### Test Waitlist:
- [ ] Visit http://localhost:3000/#coming-soon
- [ ] Join waitlist (use your email)
- [ ] **Verify:**
  - [ ] Saved to Google Sheets
  - [ ] Confirmation email received
  - [ ] Slack notification sent

#### Test Chat:
- [ ] Open chat widget on website
- [ ] Send message: "What do you do?"
- [ ] **Verify:**
  - [ ] AI response received
  - [ ] Logged to Google Sheets
- [ ] Send message: "This is urgent!"
- [ ] **Verify:**
  - [ ] Response received
  - [ ] Urgent alert in Slack

---

### 6. Customize & Brand (30 minutes)

#### Email Templates:
- [ ] Replace "AutoMagicly" with your company name
- [ ] Update all URLs to your domain
- [ ] Add your logo to emails
- [ ] Update color scheme to match brand
- [ ] Add email footer with contact info
- [ ] Test emails look good on mobile

#### Slack Channels:
- [ ] Create #bookings channel
- [ ] Create #reviews channel
- [ ] Create #referrals channel
- [ ] Create #waitlist channel
- [ ] Create #chat-urgent channel

#### Google Sheets:
- [ ] Add column headers
- [ ] Set up data validation
- [ ] Create charts/dashboards
- [ ] Set up automatic backups

---

### 7. Production Setup (15 minutes)

#### Security:
- [ ] Add webhook authentication (optional)
- [ ] Test rate limiting
- [ ] Review error handling
- [ ] Set up monitoring alerts

#### Monitoring:
- [ ] Check n8n executions daily
- [ ] Set up error notifications
- [ ] Monitor Google Sheets for data
- [ ] Review Slack alerts

#### Backups:
- [ ] Export all workflows (backup)
- [ ] Document custom changes
- [ ] Save credentials safely

---

## 🎉 Launch Checklist

Ready to go live?

- [ ] All 5 workflows imported and active
- [ ] All credentials configured
- [ ] All webhooks tested successfully
- [ ] Email templates customized
- [ ] Website `.env.local` configured
- [ ] Website deployed to production
- [ ] Production `.env` has webhook URLs
- [ ] Monitoring set up
- [ ] Team trained on Slack alerts
- [ ] Error handling tested

---

## 📊 Quick Reference

| Workflow | Webhook Path | Environment Variable |
|----------|--------------|---------------------|
| Booking | `/webhook/booking` | `NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL` |
| Reviews | `/webhook/reviews` | `NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL` |
| Referrals | `/webhook/referrals` | `NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL` |
| Waitlist | `/webhook/waitlist` | `NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL` |
| Chat | `/webhook/chat` | `N8N_CHAT_WEBHOOK_URL` |

---

## ⏱️ Total Setup Time: ~90 minutes

- Pre-setup: 5 min
- Google Sheets: 5 min
- Credentials: 10 min
- Import workflows: 15 min
- Update website: 5 min
- Testing: 20 min
- Customization: 30 min
- Production prep: 15 min

---

## 🆘 Need Help?

**Common Issues:**
- Workflow not triggering → Check webhook URL and workflow is active
- Emails not sending → Verify Gmail credentials
- Calendar error → Check timezone format
- Rate limit errors → Wait or upgrade plan

**Documentation:**
- n8n docs: https://docs.n8n.io
- See `README.md` for detailed troubleshooting

---

**You've got this! 🚀**
