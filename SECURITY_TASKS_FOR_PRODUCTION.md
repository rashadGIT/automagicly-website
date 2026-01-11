# Security Tasks for Production Deployment

This document outlines the remaining security tasks that require manual action before deploying to production.

---

## ⚠️ CRITICAL: Rotate Exposed Credentials

### Background
The following credentials were committed to git history and are potentially compromised:
- Google Service Account Private Key
- Supabase API Keys

Even though they're now in `.gitignore`, they remain in git history and could be accessed by anyone with repository access.

---

## Task 1: Rotate Google Service Account Key

### Why This Matters
- The private key was exposed in commit history
- Anyone with repo access can impersonate your service account
- They could read your Google Calendar data

### Steps to Fix

#### 1. Create New Service Account Key

```bash
# Go to Google Cloud Console
open https://console.cloud.google.com/iam-admin/serviceaccounts

# Or use gcloud CLI:
gcloud iam service-accounts keys create ~/new-key.json \
  --iam-account=automagicly-calendar-reader@automagicly.iam.gserviceaccount.com
```

#### 2. Update Environment Variables

**Local Development (.env.local):**
```bash
# Replace with new key content
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[NEW KEY CONTENT HERE]
-----END PRIVATE KEY-----"
```

**Production (.env.production):**
```bash
# Same new key
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[NEW KEY CONTENT HERE]
-----END PRIVATE KEY-----"
```

#### 3. Update AWS Amplify

```bash
# Go to AWS Amplify Console
# Navigate to: Your App → Environment variables
# Update GOOGLE_PRIVATE_KEY with new value
```

#### 4. Delete Old Key

```bash
# List all keys for the service account
gcloud iam service-accounts keys list \
  --iam-account=automagicly-calendar-reader@automagicly.iam.gserviceaccount.com

# Delete the exposed key (use KEY_ID from above)
gcloud iam service-accounts keys delete [KEY_ID] \
  --iam-account=automagicly-calendar-reader@automagicly.iam.gserviceaccount.com
```

#### 5. Test

```bash
# Restart your app and verify calendar integration still works
npm run dev
# Visit http://localhost:3001 and test booking system
```

---

## Task 2: Reset Supabase API Keys

### Why This Matters
- Both `anon` and `service_role` keys were exposed
- `service_role` key has full database access
- Attackers could read/modify all your review data

### Steps to Fix

#### 1. Navigate to Supabase Dashboard

```bash
open https://supabase.com/dashboard/project/niuadokiehxkethhrhtp/settings/api
```

#### 2. Reset Keys

1. Click **"Reset anon key"**
2. Copy the new `anon` key
3. Click **"Reset service_role key"**
4. Copy the new `service_role` key

#### 3. Update Environment Variables

**Local Development (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY="[NEW ANON KEY]"
SUPABASE_SERVICE_ROLE_KEY="[NEW SERVICE ROLE KEY]"
```

**Production (.env.production):**
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY="[NEW ANON KEY]"
SUPABASE_SERVICE_ROLE_KEY="[NEW SERVICE ROLE KEY]"
```

#### 4. Update AWS Amplify

Update these variables in Amplify Console:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### 5. Test

```bash
npm run dev
# Test review submission and admin dashboard
```

---

## Task 3: Clean Git History

### Why This Matters
Even after rotating keys, the old ones remain in git history. Anyone who cloned the repo before rotation still has access to them.

### Option A: Using BFG Repo-Cleaner (Recommended)

```bash
# 1. Install BFG
brew install bfg  # macOS
# OR download from: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Clone a fresh mirror
git clone --mirror git@github.com:yourusername/autoMagicly.git autoMagicly-mirror.git
cd autoMagicly-mirror.git

# 3. Remove sensitive files from history
bfg --delete-files .env.local --delete-files .env.production

# 4. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (WARNING: This rewrites history!)
git push --force

# 6. Clean up local repo
cd ..
rm -rf autoMagicly-mirror.git

# 7. Re-clone your repo
cd ~/projects
rm -rf autoMagicly
git clone git@github.com:yourusername/autoMagicly.git
cd autoMagicly
```

### Option B: Using git filter-branch

```bash
# 1. Backup your repo first!
cp -r autoMagicly autoMagicly-backup

# 2. Remove .env files from history
cd autoMagicly
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local .env.production' \
  --prune-empty --tag-name-filter cat -- --all

# 3. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Force push (WARNING: This rewrites history!)
git push origin --force --all
git push origin --force --tags
```

### Important Notes

⚠️ **Before running git history cleanup:**
1. Notify all team members (if any)
2. Ensure you've rotated ALL credentials first
3. Make a complete backup of the repository
4. Everyone will need to re-clone after force push

---

## Task 4: Implement Production Rate Limiting

### Why This Matters
The current in-memory rate limiting doesn't work in serverless environments (AWS Amplify). Each Lambda invocation gets a fresh memory state.

### Option A: DynamoDB-Based Rate Limiting (Recommended for AWS)

**File:** `lib/rate-limit-dynamo.ts`

```typescript
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.DB_ACCESS_KEY_ID!,
    secretAccessKey: process.env.DB_SECRET_ACCESS_KEY!,
  }
});

interface RateLimitOptions {
  identifier: string;  // IP address or session ID
  maxRequests: number; // Max requests allowed
  windowMs: number;    // Time window in milliseconds
}

export async function checkRateLimit(options: RateLimitOptions): Promise<boolean> {
  const { identifier, maxRequests, windowMs } = options;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // 1. Query recent requests
    const queryResult = await client.send(new QueryCommand({
      TableName: 'automagicly-rate-limits',
      KeyConditionExpression: 'identifier = :id AND #ts > :windowStart',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':id': { S: identifier },
        ':windowStart': { N: windowStart.toString() }
      }
    }));

    const requestCount = queryResult.Items?.length || 0;

    if (requestCount >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // 2. Record this request
    await client.send(new PutItemCommand({
      TableName: 'automagicly-rate-limits',
      Item: {
        identifier: { S: identifier },
        timestamp: { N: now.toString() },
        ttl: { N: Math.floor((now + windowMs) / 1000).toString() } // Auto-delete old records
      }
    }));

    return true; // Within rate limit
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Fail open (allow request) if rate limit check fails
  }
}
```

**Create DynamoDB Table:**

```bash
aws dynamodb create-table \
  --table-name automagicly-rate-limits \
  --attribute-definitions \
    AttributeName=identifier,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=identifier,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --time-to-live-specification \
    Enabled=true,AttributeName=ttl
```

**Update API Route:**

```typescript
import { checkRateLimit } from '@/lib/rate-limit-dynamo';

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  const allowed = await checkRateLimit({
    identifier: clientIp,
    maxRequests: 20,
    windowMs: 60000 // 1 minute
  });

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

### Option B: AWS API Gateway Rate Limiting

1. Go to AWS API Gateway Console
2. Select your API
3. Navigate to **Throttling**
4. Set limits:
   - Rate: 20 requests/second
   - Burst: 100 requests

### Option C: CloudFront Rate Limiting (AWS WAF)

```bash
# Create rate-based rule in AWS WAF
aws wafv2 create-web-acl \
  --name automagicly-rate-limit \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --rules file://rate-limit-rules.json
```

**rate-limit-rules.json:**
```json
[
  {
    "Name": "RateLimitRule",
    "Priority": 1,
    "Statement": {
      "RateBasedStatement": {
        "Limit": 2000,
        "AggregateKeyType": "IP"
      }
    },
    "Action": {
      "Block": {}
    },
    "VisibilityConfig": {
      "SampledRequestsEnabled": true,
      "CloudWatchMetricsEnabled": true,
      "MetricName": "RateLimitRule"
    }
  }
]
```

---

## Task 5: Update next.config.js (Optional Cleanup)

### Current Issue
The `env` section in `next.config.js` might expose server-only variables to client bundle.

### Recommended Fix

**File:** `next.config.js`

Remove the `env` section entirely:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // REMOVE THIS ENTIRE SECTION:
  // env: {
  //   GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  //   GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  //   ...
  // },
  async headers() {
    // ... keep headers as-is
  },
};
```

**Why:** Next.js automatically handles environment variables:
- Variables starting with `NEXT_PUBLIC_` are exposed to client
- All other variables are server-only by default
- The explicit `env` config is unnecessary and potentially dangerous

---

## Verification Checklist

Before deploying to production, verify:

- [ ] Google Service Account key rotated
- [ ] Old Google key deleted from Cloud Console
- [ ] Supabase keys reset
- [ ] All `.env.local` and `.env.production` files updated
- [ ] AWS Amplify environment variables updated
- [ ] Git history cleaned (BFG or filter-branch)
- [ ] All team members re-cloned repository
- [ ] Production build succeeds: `npm run build`
- [ ] Rate limiting implemented (DynamoDB, API Gateway, or WAF)
- [ ] `next.config.js` cleaned up (optional)
- [ ] All functionality tested in development
- [ ] Authentication flow works correctly
- [ ] Review submission/approval works
- [ ] Calendar availability works
- [ ] Chat widget works

---

## Deployment Order

1. **Rotate credentials** (Tasks 1-2)
2. **Update environment variables** everywhere
3. **Test locally** with new credentials
4. **Clean git history** (Task 3)
5. **Implement rate limiting** (Task 4)
6. **Run production build**: `npm run build`
7. **Deploy to AWS Amplify**
8. **Verify production** functionality
9. **Monitor logs** for any issues

---

## Support & Resources

- **Next.js Security**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **Google Cloud IAM**: https://cloud.google.com/iam/docs/keys-create-delete
- **Supabase Security**: https://supabase.com/docs/guides/platform/going-into-prod
- **BFG Repo-Cleaner**: https://rtyley.github.io/bfg-repo-cleaner/
- **AWS WAF Rate Limiting**: https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html

---

**Last Updated:** 2026-01-09
**Security Fixes Completed:** 12/15 (80%)
**Remaining Manual Tasks:** 3 (documented above)
