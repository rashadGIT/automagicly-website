# n8n Chat Integration Guide

This document explains how to use the AutoMagicly n8n Chat workflow in your Next.js application.

## Overview

The n8n Chat workflow provides an enterprise-grade AI chatbot with:
- ✅ API Key Authentication
- ✅ Rate Limiting (10 requests/minute per session)
- ✅ Error Handling & Notifications
- ✅ Conversation Memory (10 messages)
- ✅ FAQ Knowledge Base Integration
- ✅ Complete Logging

## Files Created

### 1. Bruno API Tests
Location: `bruno-collections/AutoMagicly-Chat-API/`

**Import into Bruno:**
```bash
# Open Bruno → Open Collection → Select:
/Users/rashad/StudioProjects/autoMagicly/bruno-collections/AutoMagicly-Chat-API
```

**Available Tests:**
- 01 - Success Case
- 02 - Missing API Key
- 03 - Wrong API Key
- 04 - Missing SessionId
- 05 - Missing Message
- 06 - Message Too Long
- 07 - Rate Limiting Test
- 08 - Conversation Memory (Step 1)
- 09 - Conversation Memory (Step 2)

### 2. Chat Client Library
Location: `lib/chat-client.ts`

**Features:**
- TypeScript types for requests/responses
- Input validation (message length, required fields)
- Error handling for all HTTP status codes
- Singleton pattern for easy reuse

**Usage:**
```typescript
import { chatClient } from '@/lib/chat-client';

const response = await chatClient.sendMessage(
  'What services does AutoMagicly offer?',
  'user-session-123',
  'user@example.com'
);

console.log(response.reply);
```

### 3. React Hook
Location: `hooks/useChat.ts`

**Features:**
- Manages chat state (messages, loading, errors)
- Automatic error handling
- Message history
- Conversation clearing

**Usage:**
```typescript
import { useChat } from '@/hooks/useChat';

function MyChatComponent() {
  const { messages, isLoading, error, sendMessage } = useChat({
    sessionId: 'user-123',
    userEmail: 'user@example.com'
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hello!')}>Send</button>
    </div>
  );
}
```

### 4. Chat Widget Component
Location: `components/N8nChatWidget.tsx`

**Features:**
- Full-featured chat UI
- Auto-scroll
- Loading indicators
- Error display
- Character counter
- Responsive design

**Usage:**
```typescript
import { N8nChatWidget } from '@/components/N8nChatWidget';
import { nanoid } from 'nanoid';

export default function ChatPage() {
  const sessionId = nanoid(); // Or get from localStorage

  return (
    <div className="container mx-auto py-8">
      <N8nChatWidget
        sessionId={sessionId}
        userEmail="user@example.com"
      />
    </div>
  );
}
```

## Environment Variables

Added to `.env.local`:

```bash
# n8n Chat Webhook - Direct Integration
NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook/automagicly-chat
NEXT_PUBLIC_N8N_CHAT_API_KEY=automagicly_chat_key_2026
```

## Setup Instructions

### 1. Prerequisites
- ✅ n8n workflow is active
- ✅ API key is configured in n8n credential
- ✅ Google Sheets are set up:
  - Chat Logs: `1ad9qLANJx33eLcRBQ5g0gWYvP4uyWHFBiLQ--SBK3vA`
  - FAQ Sheet: `1s_Cje_i6-bMqTHtEd0enCZCSwLe1URjl6R_Sw_nBM3I`
  - Rate Limits: Create "RateLimits" tab with columns: sessionId, requestCount, lastRequestTime

### 2. Test the Workflow

**Using Bruno:**
1. Open Bruno
2. Import collection from `bruno-collections/AutoMagicly-Chat-API`
3. Select "Production" environment
4. Run "01 - Success Case" to verify it works

**Using curl:**
```bash
curl -X POST https://rashadbarnett.app.n8n.cloud/webhook/automagicly-chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: automagicly_chat_key_2026" \
  -d '{
    "message": "What services does AutoMagicly offer?",
    "sessionId": "test-001",
    "userEmail": "test@example.com"
  }'
```

### 3. Integrate into Your App

**Option A: Use the Pre-built Widget**
```typescript
// app/chat/page.tsx
import { N8nChatWidget } from '@/components/N8nChatWidget';
import { nanoid } from 'nanoid';

export default function ChatPage() {
  const sessionId = nanoid();
  return <N8nChatWidget sessionId={sessionId} />;
}
```

**Option B: Use the Hook Directly**
```typescript
import { useChat } from '@/hooks/useChat';

function CustomChat() {
  const { messages, sendMessage } = useChat({
    sessionId: 'user-123'
  });
  // Build your own UI
}
```

**Option C: Use the Client Directly**
```typescript
import { chatClient } from '@/lib/chat-client';

async function handleChat() {
  const response = await chatClient.sendMessage(
    'Hello',
    'session-123'
  );
  console.log(response.reply);
}
```

## Session Management

### Generating Session IDs

**For Anonymous Users:**
```typescript
import { nanoid } from 'nanoid';

// Generate once, store in localStorage
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = nanoid();
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
};
```

**For Authenticated Users:**
```typescript
// Use user ID as session
const sessionId = `user-${userId}`;

// Or create a new session each login
const sessionId = `${userId}-${Date.now()}`;
```

## Error Handling

The chat client handles all error scenarios:

### 401 Unauthorized
```
Error: "Authentication failed"
```
**Fix:** Check API key in `.env.local`

### 400 Bad Request
```
Error: "Invalid request. Please provide 'message' (max 5000 chars) and 'sessionId'."
```
**Fix:** Ensure message and sessionId are provided

### 429 Rate Limit Exceeded
```
Error: "Rate limit exceeded. Try again in 60 seconds."
```
**Info:** User exceeded 10 requests/minute. Wait and retry.

### 500+ Server Error
```
Error: "Chat service unavailable"
```
**Fix:** Check n8n workflow execution logs

## Monitoring

### Check Logs in Google Sheets
- **Chat Logs:** https://docs.google.com/spreadsheets/d/1ad9qLANJx33eLcRBQ5g0gWYvP4uyWHFBiLQ--SBK3vA
- View all requests, responses, errors, and response times

### Email Notifications
- Errors send email to: `rashad.barnett@gmail.com`
- Contains: session ID, error details, execution link

### n8n Execution Logs
- View executions: https://rashadbarnett.app.n8n.cloud/executions
- Filter by workflow: "AutoMagicly - Chat Workflow"

## FAQ Knowledge Base

### Adding FAQs

1. Open FAQ sheet: https://docs.google.com/spreadsheets/d/1s_Cje_i6-bMqTHtEd0enCZCSwLe1URjl6R_Sw_nBM3I
2. Add rows with columns:
   - **Question:** The question users might ask
   - **Answer:** The accurate answer to provide

Example:
| Question | Answer |
|----------|--------|
| What services does AutoMagicly offer? | We provide AI-powered business automation including workflow automation, AI integration, and custom solutions. |
| How much does it cost? | We offer three pricing tiers starting at $500/month. Contact us for a custom quote. |

### How It Works

The AI Agent automatically:
1. Searches the FAQ sheet for relevant answers
2. Uses the answers to inform its responses
3. Falls back to general knowledge if not found

## Rate Limiting

### Current Limits
- **10 requests per minute** per sessionId
- Resets automatically after 1 minute
- Returns `429` status when exceeded

### Adjusting Limits

1. Open workflow in n8n
2. Edit "Calculate Rate Limit" code node
3. Change: `const isRateLimited = requestCount > 10;`
4. To: `const isRateLimited = requestCount > 20;` (or your desired limit)
5. Save workflow

## Security

### API Key Rotation

**To change the API key:**

1. **In n8n:**
   - Go to Credentials
   - Edit "AutoMagicly Chat API Key"
   - Change the value
   - Save

2. **In Your App:**
   - Update `.env.local`:
     ```bash
     NEXT_PUBLIC_N8N_CHAT_API_KEY=your_new_key
     ```

3. **In Bruno:**
   - Update `environments/Production.bru`:
     ```
     apiKey: your_new_key
     ```

### Best Practices

- ✅ Never commit `.env.local` to git
- ✅ Use different API keys for dev/staging/prod
- ✅ Rotate keys every 90 days
- ✅ Monitor usage in Google Sheets logs

## Troubleshooting

### Workflow Not Responding

1. Check workflow is active: https://rashadbarnett.app.n8n.cloud/workflow/Ndxnf18G7HEBnPrL
2. Ensure webhook is registered (open workflow in browser)
3. Check n8n execution logs for errors

### Rate Limiting Issues

- Check RateLimits sheet for current request counts
- Clear old entries manually if needed
- Increase rate limit if legitimate usage

### Gmail Notifications Not Sending

1. Check Gmail credential is connected in n8n
2. Verify "Send Error Email" node is enabled
3. Check spam folder

## Existing Chat System

Your app already has a chat widget at `components/ChatWidget.tsx` that uses a local API route (`/api/chat`).

### Migration Options

**Option 1: Keep Both (Recommended for now)**
- Keep existing chat for current users
- Add new n8n chat for testing
- Gradually migrate users

**Option 2: Replace Existing**
- Update existing ChatWidget to use n8n directly
- Remove local `/api/chat` route
- Update all imports

**Option 3: Hybrid**
- Use existing ChatWidget UI
- Change backend to call n8n webhook
- Best of both worlds

## Support

For issues or questions:
- Check n8n execution logs: https://rashadbarnett.app.n8n.cloud/executions
- Review Google Sheets logs
- Check Gmail for error notifications
- Open workflow to debug: https://rashadbarnett.app.n8n.cloud/workflow/Ndxnf18G7HEBnPrL
