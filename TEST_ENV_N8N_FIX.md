# N8N Test Environment Fix

## Problem
n8n webhooks work on localhost but fail on test environment (test.automagicly.ai)

## Root Causes

### 1. Inconsistent Webhook Paths
The test environment should use `/webhook-test/` endpoints, but some are using `/webhook/`

### 2. Environment Variables in AWS Amplify

The test branch needs these variables configured in AWS Amplify Console:

```bash
# ============================================================================
# TEST ENVIRONMENT VARIABLES (test.automagicly.ai)
# Configure these in: AWS Amplify Console → Environment variables
# ============================================================================

# Public n8n Webhooks (Browser-side)
NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook-test/booking
NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook-test/reviews
NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook-test/referrals
NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook-test/waitlist
NEXT_PUBLIC_N8N_REVIEW_GENERATOR_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook-test/review-generator

# AI Audit (Public - Browser-side)
NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook-test/audit-ai

# Server-side n8n Webhooks (NOT NEXT_PUBLIC_)
N8N_CHAT_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook-test/chat
N8N_CHAT_API_KEY=9e9b75e99e1883418181ed35b3cc61a4594cd768022a49d8e65eee36d738071b
N8N_AUDIT_AI_API_KEY=your-audit-api-key-here
N8N_AUDIT_EMAIL_WEBHOOK_URL=https://rashadbarnett.app.n8n.cloud/webhook-test/audit-email-results

# NextAuth Configuration
NEXTAUTH_URL=https://test.automagicly.ai
NEXTAUTH_SECRET=your-test-nextauth-secret-here

# Other required variables (shared with production)
GOOGLE_SERVICE_ACCOUNT_EMAIL=automagicly-calendar-reader@automagicly.iam.gserviceaccount.com
GOOGLE_CALENDAR_ID=43b775854c475d11df8d6850be20324ab6d73d82eb7c43b4fc6277a6ebeeb6d1@group.calendar.google.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_SUPABASE_URL=https://niuadokiehxkethhrhtp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

DB_ACCESS_KEY_ID=<your-access-key>
DB_SECRET_ACCESS_KEY=<your-secret-key>
REGION=us-east-1

NEXT_PUBLIC_ADMIN_PASSWORD=<your-admin-password>
```

## Fix Steps

### Step 1: Update AWS Amplify Environment Variables

1. Go to AWS Amplify Console
2. Select your app → **test branch**
3. Go to **Environment variables** in left sidebar
4. Click **Manage variables**
5. Update/Add these critical variables:

**Critical Changes:**
```diff
- N8N_CHAT_WEBHOOK_URL: https://rashadbarnett.app.n8n.cloud/webhook/chat
+ N8N_CHAT_WEBHOOK_URL: https://rashadbarnett.app.n8n.cloud/webhook-test/chat

Make sure these exist:
+ N8N_CHAT_API_KEY: 9e9b75e99e1883418181ed35b3cc61a4594cd768022a49d8e65eee36d738071b
+ NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL: https://rashadbarnett.app.n8n.cloud/webhook-test/audit-ai
+ N8N_AUDIT_EMAIL_WEBHOOK_URL: https://rashadbarnett.app.n8n.cloud/webhook-test/audit-email-results
```

6. Click **Save**
7. Amplify will automatically redeploy

### Step 2: Verify n8n Workflows are Active

In your n8n instance (https://rashadbarnett.app.n8n.cloud):

1. Check that all workflows with `/webhook-test/` endpoints are **active**:
   - Chat webhook (`/webhook-test/chat`)
   - Audit AI webhook (`/webhook-test/audit-ai`)
   - Audit email webhook (`/webhook-test/audit-email-results`)
   - Booking webhook (`/webhook-test/booking`)
   - Reviews webhook (`/webhook-test/reviews`)
   - Referrals webhook (`/webhook-test/referrals`)
   - Waitlist webhook (`/webhook-test/waitlist`)

2. Test each webhook in n8n using the "Test Webhook" button

### Step 3: Check CORS Configuration

If you're using n8n Cloud, verify CORS settings allow:
- `https://test.automagicly.ai`
- `https://automagicly.ai`

### Step 4: Verify Deployment

After Amplify redeploys:

1. Go to https://test.automagicly.ai
2. Open browser DevTools → Network tab
3. Test each feature:
   - Chat widget
   - AI Business Audit
   - Custom booking
   - Reviews form

4. Check for:
   - ✅ 200 OK responses from n8n webhooks
   - ❌ 404 errors (webhook not found)
   - ❌ 401/403 errors (authentication failed)
   - ❌ CORS errors

## Quick Diagnostic Commands

### Check if environment variables are set (run in test environment)
```javascript
// Add this to a test page temporarily
console.log({
  hasAuditWebhook: !!process.env.NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL,
  hasChatWebhook: !!process.env.N8N_CHAT_WEBHOOK_URL,
  hasChatApiKey: !!process.env.N8N_CHAT_API_KEY,
  auditWebhookUrl: process.env.NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL
});
```

### Test webhook directly
```bash
# Test chat webhook
curl -X POST https://rashadbarnett.app.n8n.cloud/webhook-test/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 9e9b75e99e1883418181ed35b3cc61a4594cd768022a49d8e65eee36d738071b" \
  -d '{"message": "test", "sessionId": "test-123"}'

# Expected: 200 OK with JSON response
# If 404: Workflow not active or webhook path wrong
# If 401/403: API key issue
```

## Common Issues & Solutions

### Issue: Chat returns default fallback message
**Cause:** `N8N_CHAT_WEBHOOK_URL` or `N8N_CHAT_API_KEY` not set
**Solution:** Add both variables to Amplify environment variables

### Issue: 404 Not Found from n8n
**Cause:** Webhook path mismatch or workflow not active
**Solution:**
1. Check workflow is active in n8n
2. Verify using `/webhook-test/` not `/webhook/` for test env

### Issue: CORS error in browser console
**Cause:** n8n not configured to allow test.automagicly.ai
**Solution:** Update CORS settings in n8n workflow or n8n Cloud settings

### Issue: Works in dev, fails in test
**Cause:** Environment variables not propagated to test branch
**Solution:** Verify variables are set specifically for test branch in Amplify

## Verification Checklist

After applying fixes, verify:

- [ ] All environment variables added to AWS Amplify for test branch
- [ ] `N8N_CHAT_WEBHOOK_URL` uses `/webhook-test/` path
- [ ] All n8n workflows are active
- [ ] Test deployment successful
- [ ] Chat widget works on test.automagicly.ai
- [ ] AI Audit works on test.automagicly.ai
- [ ] Custom booking works on test.automagicly.ai
- [ ] No CORS errors in browser console
- [ ] No 404 errors from n8n webhooks

## Production vs Test Comparison

| Feature | Test Environment | Production Environment |
|---------|-----------------|----------------------|
| Branch | `test` | `master` |
| URL | test.automagicly.ai | automagicly.ai |
| Webhook Path | `/webhook-test/` | `/webhook/` |
| NEXTAUTH_URL | https://test.automagicly.ai | https://automagicly.ai |
| Database | Shared | Shared |
| Calendar | Shared | Shared |

## Next Steps

1. **Immediately:** Update AWS Amplify environment variables for test branch
2. **Verify:** Check all n8n `/webhook-test/` workflows are active
3. **Test:** Visit test.automagicly.ai and test all features
4. **Monitor:** Check Amplify logs for any errors
5. **Document:** Note which fixes resolved the issue

## Contact
If issues persist after following these steps, check:
- AWS Amplify build logs
- n8n workflow execution logs
- Browser console for specific error messages
