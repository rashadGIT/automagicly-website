# AutoMagicly Chat API - Bruno Collection

This Bruno collection contains comprehensive API tests for the AutoMagicly Chat workflow.

## Setup

1. **Import into Bruno:**
   - Open Bruno
   - Click "Open Collection"
   - Navigate to: `/Users/rashad/StudioProjects/autoMagicly/bruno-collections/AutoMagicly-Chat-API`

2. **Select Environment:**
   - Choose "Production" environment from the dropdown
   - This sets `baseUrl` and `apiKey` automatically

## Test Scenarios

### ✅ Success Cases
- **01 - Success Case**: Normal chat request with valid authentication

### ❌ Authentication Tests
- **02 - Missing API Key**: Tests unauthorized access (401)
- **03 - Wrong API Key**: Tests invalid API key (401)

### ❌ Validation Tests
- **04 - Missing SessionId**: Tests required field validation (400)
- **05 - Missing Message**: Tests required field validation (400)
- **06 - Message Too Long**: Tests max length validation (400)

### ⚠️ Rate Limiting
- **07 - Rate Limiting Test**: Run 11 times to trigger rate limit (429)

### 🔄 Conversation Memory
- **08 - Conversation Memory (Step 1)**: User introduces themselves
- **09 - Conversation Memory (Step 2)**: Tests if AI remembers previous context

## Expected Results

| Test | Expected Status | Expected Response |
|------|----------------|-------------------|
| 01 - Success Case | 200 | AI reply with sessionId |
| 02 - Missing API Key | 401 | Unauthorized error |
| 03 - Wrong API Key | 401 | Unauthorized error |
| 04 - Missing SessionId | 400 | Validation error |
| 05 - Missing Message | 400 | Validation error |
| 06 - Message Too Long | 400 | Max length error |
| 07 - Rate Limiting | 429 (after 10 requests) | Rate limit error |
| 08 - Memory Step 1 | 200 | AI acknowledges name |
| 09 - Memory Step 2 | 200 | AI remembers name |

## Running Tests

### Individual Test
Click any test in the sidebar and click "Send"

### All Tests
Use Bruno CLI or run manually:
```bash
bruno run bruno-collections/AutoMagicly-Chat-API
```

## Notes

- **Rate Limiting**: Limits are per sessionId (10 requests/minute)
- **Conversation Memory**: Remembers last 10 messages per session
- **Response Time**: Typically 2-5 seconds for AI responses
- **Max Message Length**: 5000 characters

## Troubleshooting

### 404 - Webhook not registered
- Open workflow in n8n UI: https://rashadbarnett.app.n8n.cloud/workflow/Ndxnf18G7HEBnPrL
- Save the workflow to register the webhook

### 401 - Unauthorized
- Check API key in environment variables
- Verify credential is set correctly in n8n

### All requests failing
- Ensure workflow is active in n8n
- Check n8n execution logs for errors
