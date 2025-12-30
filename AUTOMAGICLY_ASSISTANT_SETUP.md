# AutoMagicly Assistant Setup Guide

Complete guide to setting up the AI-powered chat assistant on your website.

---

## Overview

The AutoMagicly Assistant is an AI-powered chat widget that:
- Answers visitor questions in real-time
- Blocks pricing requests and directs to booking
- Filters profanity and spam
- Logs all conversations to Google Sheets
- Alerts team for urgent messages
- Uses OpenAI for intelligent responses

---

## Architecture

```
┌─────────────────┐
│  Chat Widget    │  (Frontend - components/ChatWidget.tsx)
│  (Website UI)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  API Route      │  (Backend - app/api/chat/route.ts)
│  Rate Limiting  │  • Rate limiting (10 msg/min)
│  Profanity      │  • Profanity filter
│  Pricing Guard  │  • Pricing request blocker
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  N8N Workflow   │  (n8n-workflows/chat-workflow.json)
│  OpenAI         │  • Logs to Google Sheets
│  Google Sheets  │  • Generates AI response
│  Slack Alerts   │  • Urgent message alerts
└─────────────────┘
```

---

## What's Already Done

✅ **ChatWidget Component** - Already built and added to page.tsx
✅ **API Route** - Already configured with security features
✅ **N8N Workflow** - JSON file ready to import
✅ **Environment Variables** - Template ready in .env.example

**You just need to configure N8N and add the webhook URL!**

---

## Setup Steps

### Step 1: Get OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Name it: `AutoMagicly Chat`
4. Copy the API key (starts with `sk-...`)
5. **Save it somewhere safe** - you'll need it for N8N

**Cost:** ~$5-10/month for typical chat usage

---

### Step 2: Create Google Sheet for Chat Logs

1. Go to: https://sheets.google.com
2. Create a new sheet named: **AutoMagicly Chat Logs**
3. Create a sheet/tab named: **Chat**
4. Add these column headers (row 1):
   ```
   Timestamp | Session ID | Message | Source | Blocked | Block Reason
   ```
5. **Copy the Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
                                          ^^^^^^^^^^^^^^^^^^^
   ```

---

### Step 3: Import N8N Workflow

1. **Log in to N8N**: https://rashadbarnett.app.n8n.cloud

2. **Import the workflow:**
   - Click **"Add workflow"** (top right)
   - Click **"Import from file"**
   - Select: `n8n-workflows/chat-workflow.json`
   - Click **"Import"**

3. **The workflow includes these nodes:**
   ```
   [Webhook] → [Google Sheets] → [OpenAI] → [IF Urgent?] → [Respond]
                                                    ├─→ [Slack Alert]
                                                    └─→ [Respond]
   ```

---

### Step 4: Configure N8N Credentials

#### A. Google Sheets Credentials

1. Click on the **"Google Sheets - Log Chat"** node
2. Click **"Create New Credential"**
3. Select **"Google Sheets OAuth2 API"**
4. Click **"Connect My Account"**
5. Authorize N8N to access your Google Sheets
6. Test the connection

#### B. OpenAI Credentials

1. Click on the **"OpenAI - Generate Response"** node
2. Click **"Create New Credential"**
3. Select **"OpenAI API"**
4. Paste your OpenAI API Key (from Step 1)
5. Click **"Save"**

#### C. Slack Credentials (Optional but Recommended)

1. Go to: https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. Name: `AutoMagicly Bot`
4. Select your workspace
5. Go to **"OAuth & Permissions"**
6. Add these **Bot Token Scopes**:
   - `chat:write`
   - `chat:write.public`
7. Click **"Install to Workspace"**
8. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
9. In N8N:
   - Click on **"Slack - Urgent Alert"** node
   - Create credential
   - Paste the token
10. Create a Slack channel: **#chat-urgent**

**Note:** If you skip Slack, delete the "Slack - Urgent Alert" node or it will error

---

### Step 5: Configure Workflow Nodes

#### Update Google Sheet ID

1. Click on **"Google Sheets - Log Chat"** node
2. Under **"Document"**, select your sheet:
   - **AutoMagicly Chat Logs**
3. Under **"Sheet"**, select:
   - **Chat**
4. Verify the column mappings match your sheet headers

#### Update Slack Channel (if using Slack)

1. Click on **"Slack - Urgent Alert"** node
2. Change the channel to: `#chat-urgent`
3. Customize the message if desired

#### Customize AI Prompt (Optional)

1. Click on **"OpenAI - Generate Response"** node
2. Review the prompt:
   ```
   You are AutoMagicly's AI assistant. You help visitors understand our automation services.

   **Important Guidelines:**
   - Be friendly and helpful
   - Focus on automation benefits and time savings
   - If asked about pricing, say: "Our pricing is customized based on your specific needs. I'd recommend booking a free AI audit where we can discuss your requirements and provide an accurate quote."
   - If asked technical questions, answer helpfully
   - Keep responses concise (2-3 sentences max)
   - Always encourage booking a free audit for detailed discussions

   **What We Do:**
   - Automate repetitive business tasks
   - Email management, CRM updates, reporting, scheduling
   - Custom AI workflows with n8n
   - Save businesses 10-20 hours per week

   **User Question:**
   {{ $json.message }}
   ```
3. Customize as needed to match your brand voice

---

### Step 6: Get Webhook URL

1. Click on the **"Webhook - Chat"** node
2. Click **"Execute Node"** (to start listening)
3. Copy the **Production URL** (it will look like):
   ```
   https://rashadbarnett.app.n8n.cloud/webhook/YOUR_UNIQUE_ID
   ```
4. **Save this URL** - you'll need it for Step 7

---

### Step 7: Add Webhook URL to Environment Variables

#### For Local Development:

1. Open your `.env` file (or create from `.env.example`)
2. Add the webhook URL:
   ```bash
   N8N_CHAT_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook/YOUR_UNIQUE_ID
   ```
3. Save the file
4. Restart your dev server:
   ```bash
   npm run dev
   ```

#### For Production (AWS Amplify):

**Option A: Add to ENVIRONMENT_VARIABLES.txt (for deployment)**

Add this line to `ENVIRONMENT_VARIABLES.txt`:
```
N8N_CHAT_WEBHOOK_URL
https://rashadbarnett.app.n8n.cloud/webhook/YOUR_UNIQUE_ID
```

**Option B: Add directly in Amplify Console**

1. Go to: AWS Amplify Console
2. Select your app: **automagicly**
3. Go to: **App Settings** → **Environment variables**
4. Click **"Manage variables"**
5. Add:
   - **Key:** `N8N_CHAT_WEBHOOK_URL`
   - **Value:** `https://rashadbarnett.app.n8n.cloud/webhook/YOUR_UNIQUE_ID`
6. Click **"Save"**
7. Amplify will automatically redeploy

---

### Step 8: Activate the Workflow

1. In N8N, click the **toggle switch** at the top to activate the workflow
2. The status should change to **"Active"**
3. You should see: ✅ **Active**

---

### Step 9: Test the Chat Assistant

#### Test Locally (Development):

1. Run your dev server:
   ```bash
   npm run dev
   ```
2. Open: http://localhost:3000
3. Click the **blue chat bubble** (bottom right)
4. Try these test messages:
   - `"What can you automate?"`
   - `"How much does it cost?"` (should block and suggest booking)
   - `"I need urgent help!"` (should trigger Slack alert)
5. Check:
   - ✅ Chat widget responds
   - ✅ Google Sheet logs the conversation
   - ✅ Slack alert sent (if urgent keyword used)

#### Test on Production:

1. After deploying to Amplify
2. Go to: https://automagicly.com (or your Amplify URL)
3. Click the chat bubble
4. Send test messages
5. Verify responses work

---

## Security Features (Already Built In!)

✅ **Rate Limiting** - 10 messages per minute per session
✅ **Profanity Filter** - Blocks inappropriate language
✅ **Pricing Guard** - Blocks pricing requests, directs to booking
✅ **Session Tracking** - Each visitor gets unique session ID
✅ **Server-Side Validation** - All checks happen on backend

**These are already implemented in `/app/api/chat/route.ts`!**

---

## Chat Widget Features

The chat widget (already built!) includes:

✅ **Quick Question Buttons** - Pre-defined questions for easy start
✅ **Loading Animation** - Bouncing dots while AI responds
✅ **Mobile Responsive** - Works great on all devices
✅ **Session Persistence** - Maintains conversation context
✅ **Clean UI** - Modern, professional design
✅ **Auto-scroll** - Always shows latest message

**Quick questions:**
- "What can you automate?"
- "How does the AI Audit work?"
- "AI Partnership vs One-Off?"
- "Do you integrate with Microsoft 365?"
- "Is my data safe?"

---

## Customization Options

### Change Quick Questions

Edit: `components/ChatWidget.tsx`

```typescript
const quickQuestions = [
  'Your custom question 1?',
  'Your custom question 2?',
  'Your custom question 3?',
  // Add up to 5 questions
];
```

### Change AI Personality

Edit the OpenAI node prompt in N8N workflow to change:
- Tone of voice
- Response length
- Focus areas
- Call-to-action

### Change Rate Limit

Edit: `app/api/chat/route.ts`

```typescript
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 messages per minute
```

### Add More Blocked Keywords

Edit: `lib/utils.ts` - look for the `isPricingRequest()` function

---

## Monitoring & Analytics

### View Chat Logs

1. Open your **AutoMagicly Chat Logs** Google Sheet
2. Check the **Chat** tab
3. You'll see:
   - Timestamp of each message
   - Session ID (unique per visitor)
   - Message text
   - Source (automagicly-website)
   - Blocked status (true/false)
   - Block reason (if blocked)

### Track Metrics

**Useful metrics to monitor:**
- Total messages per day/week
- Blocked requests (pricing/profanity)
- Unique sessions (different visitors)
- Urgent messages
- Messages that led to bookings

**Pro Tip:** Create a dashboard tab in your Google Sheet with formulas:
```
=COUNTIF(A:A, ">="&TODAY())           // Messages today
=COUNTIF(E:E, TRUE)                   // Blocked messages
=COUNTIF(F:F, "pricing_request")      // Pricing requests
```

---

## Troubleshooting

### Chat Widget Not Appearing

**Issue:** Blue chat bubble doesn't show on website

**Fixes:**
1. Check `app/page.tsx` includes:
   ```typescript
   import ChatWidget from '@/components/ChatWidget';
   <ChatWidget />
   ```
2. Clear browser cache (Cmd/Ctrl + Shift + R)
3. Check browser console for errors

---

### "Sorry, I am having trouble connecting"

**Issue:** Chat widget shows error message

**Fixes:**
1. Check `.env` has `N8N_CHAT_WEBHOOK_URL` set
2. Verify N8N workflow is **Active** (toggle on)
3. Test webhook URL directly:
   ```bash
   curl -X POST https://your-n8n-url/webhook/YOUR_ID \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "sessionId": "test-123"}'
   ```
4. Check N8N execution logs for errors

---

### No Response from AI

**Issue:** Message sent but no reply

**Fixes:**
1. Check OpenAI credentials in N8N
2. Verify OpenAI API key is valid
3. Check your OpenAI account has credits
4. Review N8N execution logs

---

### Slack Alerts Not Working

**Issue:** Urgent messages don't trigger Slack

**Fixes:**
1. Verify Slack credentials in N8N
2. Check #chat-urgent channel exists
3. Verify bot is invited to channel:
   - In Slack, type: `/invite @AutoMagicly Bot`
4. Test the IF node condition (looks for "urgent" keyword)

---

### Google Sheets Not Logging

**Issue:** Messages not appearing in sheet

**Fixes:**
1. Verify Google Sheets credential is connected
2. Check sheet name is exactly: **Chat**
3. Verify column headers match workflow mapping
4. Check N8N execution logs for errors

---

## Cost Breakdown

### Required Services:

| Service | Cost | Notes |
|---------|------|-------|
| OpenAI API | $5-10/month | Based on ~300-900 messages/month |
| N8N Cloud | $0 | Already included in existing plan |
| Google Sheets | $0 | Free with Google account |

### Optional Services:

| Service | Cost | Notes |
|---------|------|-------|
| Slack | $0 | Free tier is fine |

**Total Monthly Cost:** ~$5-10/month

**vs Live Chat Software:**
- Intercom: $74/month
- Drift: $2,500/month
- LiveChat: $16/month

**Savings:** $6-2,490/month! 🎉

---

## Advanced Features (Optional)

### Add Conversation Memory

Modify the N8N workflow to:
1. Store conversation history per session
2. Pass previous messages to OpenAI
3. Enable context-aware responses

### Add Lead Capture

When user seems interested, bot can:
1. Ask for email
2. Automatically create HubSpot contact
3. Trigger email sequence

### A/B Test Responses

1. Create multiple AI prompts
2. Randomly assign visitors to versions
3. Track which leads to more bookings

### Add Voice Support

Integrate with:
- Web Speech API (browser)
- OpenAI Whisper (transcription)
- Enable voice chat

---

## Best Practices

### Do's ✅

- Keep responses concise (2-3 sentences)
- Always encourage booking for details
- Log all conversations for review
- Monitor for spam/abuse patterns
- Update AI prompt based on common questions

### Don'ts ❌

- Don't give specific pricing through chat
- Don't make promises AI can't keep
- Don't reveal internal business info
- Don't let AI handle sensitive data
- Don't ignore urgent message alerts

---

## FAQ

**Q: Can I customize the chat bubble appearance?**
A: Yes! Edit `components/ChatWidget.tsx` - the CSS classes control all styling.

**Q: Will chat history persist if user refreshes page?**
A: No, currently each session is fresh. You can add localStorage to persist messages.

**Q: Can I add the chat to other pages?**
A: Yes! It's already a global component. It appears on all pages automatically.

**Q: How do I change the "AutoMagicly Assistant" name?**
A: Edit line 97 in `components/ChatWidget.tsx`:
```typescript
<h3 className="font-bold">Your Custom Name</h3>
```

**Q: Can I see which chat sessions led to bookings?**
A: Track session IDs! When someone books, cross-reference their session ID in chat logs.

**Q: What if OpenAI goes down?**
A: The API route has fallback responses. Users still get a helpful message even if OpenAI fails.

**Q: Can I use a different AI model?**
A: Yes! In the N8N OpenAI node, you can select GPT-3.5, GPT-4, etc. (GPT-3.5 is cheaper).

---

## Next Steps

After setup is complete:

1. ✅ Test thoroughly on dev and production
2. ✅ Monitor chat logs for first week
3. ✅ Refine AI prompt based on actual questions
4. ✅ Add common questions to quick buttons
5. ✅ Track chat → booking conversion rate
6. ✅ Adjust rate limits if needed

---

## Support

**Files to Reference:**
- `components/ChatWidget.tsx` - Frontend UI
- `app/api/chat/route.ts` - Backend logic
- `n8n-workflows/chat-workflow.json` - N8N workflow
- `lib/utils.ts` - Helper functions

**N8N Workflow Overview:**
See `n8n-workflows/WORKFLOWS-OVERVIEW.md` for visual diagrams

---

## Checklist

Use this to track your setup progress:

- [ ] Got OpenAI API key
- [ ] Created Google Sheet for logs
- [ ] Imported N8N workflow
- [ ] Configured Google Sheets credential
- [ ] Configured OpenAI credential
- [ ] Configured Slack credential (optional)
- [ ] Updated Google Sheet ID in workflow
- [ ] Updated Slack channel in workflow
- [ ] Got webhook URL from N8N
- [ ] Added webhook URL to .env
- [ ] Activated N8N workflow
- [ ] Tested chat locally
- [ ] Added webhook URL to Amplify (production)
- [ ] Tested chat on production

---

## You're All Set! 🎉

Your AutoMagicly Assistant is ready to engage visitors and help grow your business!

**What happens now:**
1. Visitors click the chat bubble
2. AI answers their questions instantly
3. Pricing requests get redirected to booking
4. All conversations logged automatically
5. Urgent messages alert your team
6. You gain insights into customer questions

**Enjoy your automated AI assistant!** 🤖
