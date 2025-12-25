# 🚀 n8n Workflows - Start Here

Welcome to your AutoMagicly n8n workflows package!

---

## 📦 What's Included

This folder contains **5 production-ready n8n workflows** for your website:

### Workflow Files (JSON):

1. **booking-workflow.json** (6.3 KB)
   - Custom booking system (replaces Calendly)
   - Creates Google Calendar events with Meet links
   - Sends confirmation emails
   - Best for: AI Audit bookings

2. **reviews-workflow.json** (7.2 KB)
   - Collects and manages customer reviews
   - Auto-responds based on rating (4-5 stars vs 1-3 stars)
   - Requests Google reviews from happy customers
   - Best for: Building social proof

3. **referrals-workflow.json** (8.8 KB)
   - Manages customer referral program
   - Thanks referrer + introduces to referred contact
   - Tracks $100 + $500 rewards
   - Best for: Growth and customer acquisition

4. **waitlist-workflow.json** (6.2 KB)
   - Manages product waitlist signups
   - Sends confirmation emails
   - Notifies when products launch
   - Best for: Upcoming products/features

5. **chat-workflow.json** (5.6 KB)
   - AI-powered chat responses
   - Uses OpenAI for intelligent replies
   - Alerts team for urgent messages
   - Best for: Visitor engagement

### Documentation Files:

- **START-HERE.md** ← You are here!
- **SETUP-CHECKLIST.md** - Step-by-step setup guide
- **README.md** - Complete documentation
- **WORKFLOWS-OVERVIEW.md** - Visual architecture guide

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Choose Your Path

**Option A: Set Up Everything** (90 minutes)
→ See `SETUP-CHECKLIST.md` for complete setup

**Option B: Start with Essentials** (30 minutes)
→ Just set up Booking + Chat workflows

**Option C: Learn First** (10 minutes)
→ Read `WORKFLOWS-OVERVIEW.md` for architecture

### Step 2: Import to n8n

1. Go to your n8n instance
2. Click "Workflows" → "Import from File"
3. Upload `booking-workflow.json`
4. Click "Import"
5. Repeat for other workflows

### Step 3: Configure

1. Set up credentials (Google, Gmail, etc.)
2. Update webhook URLs in `.env.local`
3. Test each workflow
4. Customize email templates

---

## 📚 Documentation Guide

### For First-Time Setup:
1. **Read:** `WORKFLOWS-OVERVIEW.md` (understand architecture)
2. **Follow:** `SETUP-CHECKLIST.md` (step-by-step setup)
3. **Reference:** `README.md` (troubleshooting & customization)

### For Experienced n8n Users:
1. Import JSON files
2. Configure credentials
3. Update Google Sheet IDs
4. Test and deploy

### For Quick Testing:
1. Import `booking-workflow.json`
2. Set up Google Calendar credentials
3. Get webhook URL
4. Add to `.env.local`
5. Test on website

---

## 🎯 Recommended Setup Order

### Priority 1: Essential (30 min)
- ✅ **Booking Workflow** - Replaces Calendly, handles AI Audits
- ✅ **Chat Workflow** - Engages visitors in real-time

### Priority 2: Growth (30 min)
- ✅ **Reviews Workflow** - Builds social proof
- ✅ **Referrals Workflow** - Customer acquisition engine

### Priority 3: Future (15 min)
- ✅ **Waitlist Workflow** - For upcoming products

---

## 🔑 What You Need

### Required:
- [ ] n8n instance (cloud or self-hosted)
- [ ] Google account (for Calendar, Sheets, Gmail)
- [ ] Gmail or SendGrid (for emails)

### Optional:
- [ ] Slack workspace (for team notifications)
- [ ] HubSpot account (for CRM)
- [ ] OpenAI API key (for AI chat - chat workflow only)

---

## 💡 Key Features

### All Workflows Include:

✅ **Production-Ready**
- Fully tested and functional
- Error handling built-in
- Data validation included

✅ **Easy to Customize**
- Clear node names
- Commented sections
- Modular design

✅ **Well-Documented**
- Setup guides
- Troubleshooting help
- Visual diagrams

✅ **Privacy-Focused**
- Data stays in your systems
- No third-party sharing
- GDPR-friendly

---

## 📊 What Each Workflow Does

### Booking Workflow
```
Website → n8n → Google Calendar + Gmail + Slack + HubSpot
```
**Creates:** Calendar events, confirmation emails, team alerts

### Reviews Workflow
```
Website → n8n → Google Sheets → [IF high rating] Thank you email
                                [IF low rating] Alert owner
```
**Manages:** Customer feedback, reputation management

### Referrals Workflow
```
Website → n8n → Gmail (2 emails) + Slack + HubSpot + Google Sheets
```
**Generates:** New leads from happy customers

### Waitlist Workflow
```
Website → n8n → Google Sheets + Gmail + Slack + HubSpot
```
**Captures:** Interest in upcoming products

### Chat Workflow
```
Website → n8n → OpenAI → [IF urgent] Slack alert
```
**Provides:** AI-powered customer support

---

## 🎨 Customization Options

### Easy to Change:
- ✅ Email templates (text, branding, links)
- ✅ Time slots (booking workflow)
- ✅ Meeting duration (30 min → 60 min)
- ✅ Referral rewards ($100/$500 → your amounts)
- ✅ AI chat personality (OpenAI prompt)

### Advanced Customization:
- ✅ Add more CRM integrations
- ✅ Send SMS notifications (Twilio)
- ✅ Add follow-up sequences
- ✅ Create automation reports
- ✅ Add conditional logic

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Import all workflows | 10 min |
| Set up credentials | 15 min |
| Configure & customize | 30 min |
| Test all workflows | 25 min |
| Deploy to production | 10 min |
| **Total** | **~90 min** |

**Just Essentials (Booking + Chat):** ~30 minutes

---

## 🆘 Need Help?

### Quick Links:
- **Setup Issues:** See `SETUP-CHECKLIST.md`
- **How It Works:** See `WORKFLOWS-OVERVIEW.md`
- **Troubleshooting:** See `README.md` → Troubleshooting section
- **n8n Docs:** https://docs.n8n.io

### Common Issues:

**"Workflow not triggering"**
→ Check: Workflow is active + webhook URL is correct

**"Emails not sending"**
→ Check: Gmail credentials + email templates

**"Calendar error"**
→ Check: Google Calendar credentials + timezone format

---

## 💰 Cost Breakdown

### Monthly Costs:
- **n8n Cloud Starter:** $20/month (5,000 executions)
- **Google Workspace:** Free (Gmail, Calendar, Sheets)
- **Slack:** Free (basic plan)
- **HubSpot:** Free (starter CRM)
- **OpenAI:** ~$5-10/month (chat only)

**Total: $25-30/month**

**What You're Replacing:**
- Calendly Pro: $12/month ✂️
- Intercom/Drift: $79/month ✂️
- Zapier: $30/month ✂️
- Email automation: $20/month ✂️

**Total Savings: $100+/month** 💰

---

## 🎉 What Happens After Setup

Once configured, your workflows will:

1. **Automatically handle bookings** → Calendar events + emails
2. **Respond to website visitors** → AI chat support
3. **Collect reviews** → Build social proof
4. **Process referrals** → Grow customer base
5. **Manage waitlists** → Capture future leads

**All running 24/7, fully automated!** 🚀

---

## 🚀 Ready to Start?

### Choose Your Next Step:

**→ New to n8n?**
Start with: `WORKFLOWS-OVERVIEW.md`

**→ Ready to set up?**
Start with: `SETUP-CHECKLIST.md`

**→ Just want to test?**
Import: `booking-workflow.json` and test

**→ Need complete docs?**
Read: `README.md`

---

## 📝 Files Summary

```
n8n-workflows/
├── START-HERE.md              ← You are here
├── SETUP-CHECKLIST.md         ← Step-by-step setup
├── README.md                  ← Complete documentation
├── WORKFLOWS-OVERVIEW.md      ← Visual architecture
├── booking-workflow.json      ← Booking system
├── reviews-workflow.json      ← Reviews management
├── referrals-workflow.json    ← Referral program
├── waitlist-workflow.json     ← Waitlist signups
└── chat-workflow.json         ← AI chat support
```

**Total: 5 workflows + 4 docs = Everything you need!**

---

## 🎯 Success Checklist

By the end of setup, you'll have:

- [ ] All workflows imported to n8n
- [ ] Google Calendar creating events automatically
- [ ] Confirmation emails sending to customers
- [ ] Team notifications in Slack (optional)
- [ ] CRM updating automatically (optional)
- [ ] AI chat responding to visitors
- [ ] Data logging to Google Sheets
- [ ] Website fully integrated with n8n

**Result:** A fully automated, professional booking and customer engagement system! 🎉

---

## 💪 You've Got This!

These workflows are:
✅ Production-tested
✅ Fully documented
✅ Easy to customize
✅ Ready to deploy

**Estimated time to full setup: 90 minutes**
**Estimated time to first booking: 30 minutes**

Let's get started! 🚀

**Next Step:** Open `SETUP-CHECKLIST.md` and follow along!
