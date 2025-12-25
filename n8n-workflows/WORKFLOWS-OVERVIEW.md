# n8n Workflows Overview

Visual guide to all AutoMagicly workflows and their connections.

---

## 🎯 Complete Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AutoMagicly Website                        │
│          (Next.js + React + Tailwind)                   │
└───────────┬─────────────────────────────────────────────┘
            │
            │ Webhooks
            ▼
┌───────────────────────────────────────────────────────────┐
│                    n8n Instance                           │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Booking    │  │   Reviews    │  │  Referrals   │   │
│  │   Workflow   │  │   Workflow   │  │   Workflow   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │            │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │   Waitlist   │  │     Chat     │                      │
│  │   Workflow   │  │   Workflow   │                      │
│  └──────┬───────┘  └──────┬───────┘                      │
│         │                 │                               │
└─────────┼─────────────────┼───────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
│                                                         │
│  • Google Calendar    • Google Sheets                  │
│  • Gmail/SendGrid     • Slack                          │
│  • HubSpot CRM        • OpenAI                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Workflow Details

### 1️⃣ Booking Workflow

**Purpose:** Handle AI Audit bookings (replaces Calendly)

**Trigger:** Website booking form submission

**Flow:**
```
Website Form
    ↓
[Webhook] Receive booking data
    ↓
[Google Calendar] Create event + Meet link
    ↓
[Gmail] Send confirmation to client
    ↓
[Slack] Notify team
    ↓
[HubSpot] Add to CRM
    ↓
[Response] Success message to website
```

**Input Data:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "date": "2024-01-20",
  "time": "14:00",
  "dateTime": "2024-01-20 14:00",
  "timezone": "America/New_York",
  "notes": "Need help with invoice automation",
  "type": "AI Audit Booking"
}
```

**Output:**
- ✅ Calendar event with 30min duration
- ✅ Google Meet link
- ✅ Confirmation email to client
- ✅ Team notification
- ✅ CRM record created

---

### 2️⃣ Reviews Workflow

**Purpose:** Collect and manage customer reviews

**Trigger:** Review form submission

**Flow:**
```
Website Form
    ↓
[Webhook] Receive review
    ↓
[Google Sheets] Save review
    ↓
[IF] Check rating (4-5 stars OR 1-3 stars)
    ↓
[4-5 Stars Path]           [1-3 Stars Path]
    ↓                          ↓
[Gmail] Thank you          [Gmail] Alert owner
    ↓                          ↓
[Request] Google review    [Action] Follow up needed
    ↓                          ↓
[Slack] Notify team        [Slack] Urgent alert
```

**Input Data:**
```json
{
  "name": "Jane Smith",
  "company": "Tech Corp",
  "email": "jane@techcorp.com",
  "rating": 5,
  "review": "AutoMagicly saved us 15 hours per week!"
}
```

**Output:**
- ✅ Review saved to Google Sheets
- ✅ Automated thank you (4-5 stars)
- ✅ Alert for low ratings (1-3 stars)
- ✅ Team notification

---

### 3️⃣ Referrals Workflow

**Purpose:** Manage customer referral program

**Trigger:** Referral form submission

**Flow:**
```
Website Form
    ↓
[Webhook] Receive referral
    ↓
[Google Sheets] Save referral
    ↓
[Parallel Actions]
    ├─→ [Gmail] Thank referrer ($100 + $500 rewards)
    ├─→ [Gmail] Introduce to referred contact
    ├─→ [Slack] Notify team
    └─→ [HubSpot] Add lead to CRM
    ↓
[Response] Success message
```

**Input Data:**
```json
{
  "yourName": "John Doe",
  "yourEmail": "john@example.com",
  "yourCompany": "Acme Inc",
  "referralName": "Sarah Johnson",
  "referralEmail": "sarah@otherco.com",
  "referralCompany": "Other Co",
  "whyRefer": "They struggle with manual data entry"
}
```

**Output:**
- ✅ Referral saved
- ✅ Thank you email to referrer
- ✅ Introduction email to referred contact
- ✅ Lead added to CRM
- ✅ Team notified

---

### 4️⃣ Waitlist Workflow

**Purpose:** Manage product waitlist signups

**Trigger:** Waitlist form submission

**Flow:**
```
Website Form
    ↓
[Webhook] Receive signup
    ↓
[Google Sheets] Add to waitlist
    ↓
[Parallel Actions]
    ├─→ [Gmail] Send confirmation
    ├─→ [Slack] Notify team
    └─→ [HubSpot] Tag as subscriber
    ↓
[Response] Success message
```

**Input Data:**
```json
{
  "email": "user@example.com",
  "product": "Monthly Subscription Plan"
}
```

**Products:**
- Monthly Subscription Plan
- AI Email Assistant
- Workflow Template Library

**Output:**
- ✅ Email added to waitlist
- ✅ Confirmation email sent
- ✅ CRM updated with tag
- ✅ Team notified

---

### 5️⃣ Chat Workflow

**Purpose:** AI-powered chat responses

**Trigger:** Chat widget message

**Flow:**
```
Chat Widget
    ↓
[Webhook] Receive message
    ↓
[Google Sheets] Log conversation
    ↓
[OpenAI] Generate AI response
    ↓
[IF] Check for "urgent" keyword
    ↓
[Yes]                    [No]
    ↓                       ↓
[Slack] Alert team      [Response] Send AI reply
    ↓
[Response] Send AI reply
```

**Input Data:**
```json
{
  "sessionId": "abc-123-xyz",
  "message": "What services do you offer?",
  "source": "automagicly-website"
}
```

**Output:**
- ✅ Message logged
- ✅ AI response generated
- ✅ Urgent alerts (if keyword detected)

---

## 🔗 Integration Map

```
┌──────────────────┐
│  Google Calendar │ ◄─── Booking
└──────────────────┘

┌──────────────────┐
│  Google Sheets   │ ◄─── All Workflows
└──────────────────┘

┌──────────────────┐
│   Gmail/SMTP     │ ◄─── All Workflows
└──────────────────┘

┌──────────────────┐
│      Slack       │ ◄─── All Workflows (Optional)
└──────────────────┘

┌──────────────────┐
│     HubSpot      │ ◄─── Booking, Referrals, Waitlist (Optional)
└──────────────────┘

┌──────────────────┐
│     OpenAI       │ ◄─── Chat Only
└──────────────────┘
```

---

## 📈 Data Flow Summary

### Website → n8n

| Form | Webhook Path | Method |
|------|-------------|--------|
| Booking | `/webhook/booking` | POST |
| Reviews | `/webhook/reviews` | POST |
| Referrals | `/webhook/referrals` | POST |
| Waitlist | `/webhook/waitlist` | POST |
| Chat | `/webhook/chat` | POST |

### n8n → External Services

| Service | Used By | Purpose |
|---------|---------|---------|
| Google Calendar | Booking | Create events |
| Google Sheets | All | Data storage |
| Gmail | All | Email notifications |
| Slack | All (optional) | Team alerts |
| HubSpot | Booking, Referrals, Waitlist | CRM integration |
| OpenAI | Chat | AI responses |

---

## 🎨 Workflow Complexity

| Workflow | Nodes | Complexity | Setup Time |
|----------|-------|------------|------------|
| Booking | 6 | High | 10 min |
| Reviews | 7 | Medium | 8 min |
| Referrals | 7 | Medium | 8 min |
| Waitlist | 5 | Low | 5 min |
| Chat | 5 | Medium | 7 min |

**Total Setup:** ~40 minutes

---

## 💾 Data Storage

All workflows save data to Google Sheets for:
- ✅ Easy access and review
- ✅ Backup and export
- ✅ Analytics and reporting
- ✅ No database setup required

**Recommended Sheet Structure:**

```
AutoMagicly Data (Single Google Sheet)
├── Bookings (Tab)
├── Reviews (Tab)
├── Referrals (Tab)
├── Waitlist (Tab)
└── Chat Logs (Tab)
```

---

## 🔔 Notification Strategy

### Slack Channels (Recommended):
- `#bookings` - New AI Audit bookings
- `#reviews` - Customer reviews
- `#referrals` - New referrals
- `#waitlist` - Waitlist signups
- `#chat-urgent` - Urgent chat messages

### Email Alerts:
- Low ratings (1-3 stars) → Owner email
- All form submissions → Logged to Sheets
- Customer confirmations → Gmail

---

## 🚀 Quick Start Order

Recommended order to set up workflows:

1. **Booking** (Most important - replaces Calendly)
2. **Chat** (Engages visitors in real-time)
3. **Reviews** (Builds social proof)
4. **Referrals** (Growth engine)
5. **Waitlist** (Future products)

---

## 📊 Expected Volume

Based on typical automation agency traffic:

| Workflow | Daily | Weekly | Monthly |
|----------|-------|--------|---------|
| Bookings | 2-5 | 10-25 | 40-100 |
| Chat | 10-30 | 70-210 | 300-900 |
| Reviews | 1-2 | 5-10 | 20-40 |
| Referrals | 0-1 | 2-5 | 10-20 |
| Waitlist | 1-3 | 7-20 | 30-80 |

**Total n8n Executions:** ~500-1,100 per month

---

## 💰 Cost Estimate

### n8n Cloud:
- **Starter:** $20/month (5,000 executions)
- **Pro:** $50/month (50,000 executions)

### Services:
- Google Workspace: Free (Gmail, Calendar, Sheets)
- Slack: Free (basic plan)
- HubSpot: Free (starter CRM)
- OpenAI: ~$5-10/month (chat usage)

**Total Monthly Cost:** $25-60/month

**vs Calendly Pro:** $12/month (saved!)
**vs Other Tools:** Hundreds per month (saved!)

---

## 🎯 Success Metrics

Track these in your Google Sheets:

### Bookings:
- Conversion rate: Website visitors → Bookings
- Show rate: Bookings → Completed audits
- Close rate: Audits → Clients

### Reviews:
- Average rating
- Response rate
- Google review conversions

### Referrals:
- Referrals submitted
- Referral → Booking rate
- Referral → Client rate

### Waitlist:
- Total signups by product
- Launch email performance

### Chat:
- Messages per session
- Chat → Booking rate
- Urgent issues resolved

---

## 🛡️ Reliability

All workflows include:
- ✅ Error handling
- ✅ Automatic retries
- ✅ Execution logs
- ✅ Data validation
- ✅ Rate limiting (website-side)

**Uptime:**
- n8n Cloud: 99.9% SLA
- Self-hosted: Depends on hosting

---

## 🎉 Ready to Launch!

All workflows are:
- ✅ Production-ready
- ✅ Fully tested
- ✅ Well-documented
- ✅ Easy to customize
- ✅ Scalable

**Next Steps:**
1. See `SETUP-CHECKLIST.md` for step-by-step setup
2. See `README.md` for detailed documentation
3. Import workflows to n8n
4. Configure credentials
5. Test each workflow
6. Go live! 🚀
