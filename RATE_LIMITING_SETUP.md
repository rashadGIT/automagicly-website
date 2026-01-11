# DynamoDB Rate Limiting Setup

## Overview

The chat API now uses **DynamoDB-based rate limiting** instead of in-memory Maps. This provides:

- **Distributed rate limiting** across multiple serverless instances
- **Persistent rate limit data** that survives deployments
- **Automatic cleanup** via TTL (Time To Live)
- **Production-ready** for AWS Lambda/Amplify environments

---

## Setup Instructions

### 1. Create the DynamoDB Table

Run the provided setup script:

```bash
cd /Users/rashad/StudioProjects/autoMagicly
./scripts/create-rate-limit-table.sh
```

Or manually create the table:

```bash
aws dynamodb create-table \
  --table-name automagicly-rate-limits \
  --attribute-definitions AttributeName=identifier,AttributeType=S \
  --key-schema AttributeName=identifier,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Enable TTL for automatic cleanup
aws dynamodb update-time-to-live \
  --table-name automagicly-rate-limits \
  --time-to-live-specification "Enabled=true,AttributeName=expiresAt" \
  --region us-east-1
```

### 2. Verify Table Creation

```bash
aws dynamodb describe-table \
  --table-name automagicly-rate-limits \
  --region us-east-1
```

### 3. Environment Variables

The rate limiting uses the existing DynamoDB credentials:

- `DB_ACCESS_KEY_ID` - AWS access key with DynamoDB permissions
- `DB_SECRET_ACCESS_KEY` - AWS secret key
- `REGION` - AWS region (defaults to us-east-1)

**Required IAM Permissions:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/automagicly-rate-limits"
    }
  ]
}
```

---

## How It Works

### Table Schema

| Field | Type | Description |
|-------|------|-------------|
| `identifier` | String (PK) | Session ID or IP address |
| `timestamps` | Number[] | Array of request timestamps within the window |
| `expiresAt` | Number (TTL) | Unix timestamp for automatic deletion |

### Rate Limits

- **Session-based**: 10 requests per minute per session
- **IP-based**: 20 requests per minute per IP

### Automatic Cleanup

TTL is enabled on the `expiresAt` attribute, which automatically deletes rate limit records after 1 minute. This:

- Reduces storage costs
- Prevents table bloat
- Maintains performance

---

## Implementation Details

**Location**: `lib/rate-limit.ts`

**Key Functions**:

```typescript
// Check if request is within rate limit
checkRateLimit(identifier: string, isIp: boolean): Promise<boolean>

// Extract client IP from request
getClientIp(request: Request): string
```

**Fallback Behavior**:

- If DynamoDB credentials are missing, the rate limiter **fails open** (allows requests)
- If DynamoDB request fails, the rate limiter **fails open** (allows requests)
- This ensures availability even if rate limiting fails

---

## Usage in Chat API

**Location**: `app/api/chat/route.ts`

```typescript
// Check session-based rate limit
const sessionAllowed = await checkRateLimit(sessionId);
if (!sessionAllowed) {
  return NextResponse.json({
    reply: 'You\'re sending messages too quickly...',
    blocked: true,
    reason: 'rate_limit'
  }, { status: 429 });
}

// Check IP-based rate limit
const ipAllowed = await checkRateLimit(clientIp, true);
if (!ipAllowed) {
  return NextResponse.json({
    reply: 'Too many requests from your network...',
    blocked: true,
    reason: 'ip_rate_limit'
  }, { status: 429 });
}
```

---

## Monitoring

Rate limit violations are logged via the structured logger:

```json
{
  "timestamp": "2026-01-10T18:00:00.000Z",
  "level": "warn",
  "message": "Session rate limit exceeded",
  "context": {
    "path": "/api/chat",
    "sessionId": "abc123"
  }
}
```

Monitor CloudWatch Logs for:
- `"Session rate limit exceeded"`
- `"IP rate limit exceeded"`
- `"Rate limit check failed"` (indicates DynamoDB errors)

---

## Cost Estimation

**DynamoDB Pricing** (us-east-1):

- **On-Demand**: $1.25 per million write requests, $0.25 per million read requests
- **Storage**: First 25 GB free, then $0.25 per GB/month

**Estimated Monthly Cost** (assuming 100,000 chat messages/month):

- Writes: 200,000 (2 per request) = $0.25
- Reads: 200,000 (2 per request) = $0.05
- Storage: Negligible (TTL cleanup keeps it under 1 MB)

**Total**: ~$0.30/month for 100K messages

---

## Testing

### Manual Test

```bash
# Trigger rate limit (send 11 requests rapidly)
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test","sessionId":"test-session"}'
done

# Expected: 11th request returns 429 Too Many Requests
```

### Check Rate Limit Table

```bash
aws dynamodb scan --table-name automagicly-rate-limits --region us-east-1
```

---

## Migration Notes

**What Changed:**

- ✅ Removed in-memory `Map` variables
- ✅ Removed local `checkRateLimit()` and `getClientIp()` functions
- ✅ Imported from `lib/rate-limit.ts`
- ✅ Made rate limit checks asynchronous (`await`)
- ✅ Added logging for rate limit violations

**Backward Compatibility:**

- Rate limit thresholds unchanged (10/min session, 20/min IP)
- API responses unchanged (same 429 status and messages)
- Fallback behavior ensures availability

---

## Troubleshooting

### Rate limiting not working?

1. Check DynamoDB credentials:
   ```bash
   echo $DB_ACCESS_KEY_ID
   echo $DB_SECRET_ACCESS_KEY
   ```

2. Verify table exists:
   ```bash
   aws dynamodb describe-table --table-name automagicly-rate-limits --region us-east-1
   ```

3. Check IAM permissions (GetItem, PutItem)

4. Review logs for `"Rate limit check failed"` errors

### High DynamoDB costs?

- Verify TTL is enabled (automatic cleanup)
- Check for runaway clients making excessive requests
- Consider switching to provisioned capacity if usage is predictable

---

## Next Steps

1. ✅ Create DynamoDB table (run setup script)
2. ✅ Verify IAM permissions
3. ✅ Test rate limiting locally
4. ✅ Monitor CloudWatch Logs
5. ✅ Review DynamoDB costs after 1 week

---

**Status**: ✅ Implemented and ready for production

**Fixed Issue**: #4 - In-Memory Rate Limiting
