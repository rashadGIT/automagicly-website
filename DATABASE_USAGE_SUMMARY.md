# Database Usage in AutoMagicly

You're currently using **TWO databases** for reviews: Supabase and DynamoDB

---

## Supabase Usage

### Active Files Using Supabase:

1. **`lib/supabase.ts`**
   - Configuration file
   - Exports `supabase` (client-side) and `supabaseAdmin` (server-side)
   - Credentials from: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

2. **`app/api/reviews-old/route.ts`**
   - **GET** - Fetch reviews from Supabase `reviews` table
   - **PATCH** - Update review status/featured in Supabase
   - **DELETE** - Delete review from Supabase
   - Uses: `createClient()` from `@supabase/supabase-js`

3. **`app/api/reviews-old/approve/route.ts`**
   - **GET** - Email-based approval via token
   - Updates Supabase review to `approved` status
   - Clears one-time use token

4. **`app/api/reviews-old/reject/route.ts`**
   - **GET** - Email-based rejection via token
   - Updates Supabase review to `rejected` status
   - Clears one-time use token

### Supabase Table Structure:
```sql
Table: reviews
Columns:
  - id (uuid)
  - name (text, optional)
  - email (text, optional)
  - company (text, optional)
  - rating (integer)
  - review_text (text)
  - service_type (text)
  - status (enum: 'pending' | 'approved' | 'rejected')
  - featured (boolean, optional)
  - approval_token (text, optional)
  - token_expires_at (timestamp, optional)
  - created_at (timestamp)
  - approved_at (timestamp, optional)
  - updated_at (timestamp)
```

### Where Supabase Is Used:
- ✅ Admin dashboard (`/admin/reviews`)
- ✅ Email approval links (`/api/reviews-old/approve?token=xxx`)
- ✅ Email rejection links (`/api/reviews-old/reject?token=xxx`)
- ✅ Review CRUD operations in admin panel

---

## DynamoDB Usage

### Active Files Using DynamoDB:

1. **`lib/db.ts`**
   - Full CRUD operations for DynamoDB
   - Functions: `getReviews()`, `createReview()`, `updateReview()`, `deleteReview()`
   - Credentials from: `DB_ACCESS_KEY_ID`, `DB_SECRET_ACCESS_KEY`

2. **`app/api/reviews/route.ts`**
   - **GET** - Fetch reviews from DynamoDB `automagicly-reviews` table
   - Used by: Public website (with auth filtering)
   - Direct DynamoDB client (doesn't use lib/db.ts)

3. **`app/api/reviews-simple/route.ts`**
   - **GET** - Fetch ALL reviews from DynamoDB (admin-only)
   - Used by: Originally homepage, now admin dashboard only
   - Direct DynamoDB client (doesn't use lib/db.ts)

### DynamoDB Table Structure:
```
Table: automagicly-reviews
Key Schema:
  - id (partition key, custom format: review-timestamp-random)
Attributes:
  - name
  - email
  - company
  - rating
  - review_text
  - service_type
  - status
  - featured
  - created_at (timestamp number)
  - approved_at (timestamp number, optional)
  - updated_at (timestamp number)
```

### Where DynamoDB Is Used:
- ✅ Homepage reviews display (`/` via `/api/reviews?status=approved`)
- ❌ NOT used by admin dashboard
- ❌ NOT used by email approval system

---

## The Problem: Database Duplication

### You Have Two Separate Databases:

**Supabase:**
- Used for: Admin dashboard, email approvals
- Location: Supabase cloud (PostgreSQL)
- ID Format: UUID (e.g., `123e4567-e89b-12d3-a456-426614174000`)

**DynamoDB:**
- Used for: Homepage display
- Location: AWS (NoSQL)
- ID Format: Custom (e.g., `review-1767118694815-34552`)

### This Means:

1. ❌ Reviews in Supabase **DON'T** appear on homepage
2. ❌ Reviews in DynamoDB **DON'T** appear in admin dashboard
3. ❌ Managing reviews in admin **doesn't** affect homepage
4. ❌ You're paying for TWO databases
5. ❌ Data is inconsistent between systems

---

## Recommended Solution

### Option A: Use Only Supabase (Recommended)

**Advantages:**
- ✅ Single source of truth
- ✅ Better admin features (RLS, auth, etc.)
- ✅ Free tier is generous (500MB, 2GB bandwidth)
- ✅ PostgreSQL = more powerful queries
- ✅ Already set up for email approvals

**Changes Needed:**
1. Update `/api/reviews` to use Supabase instead of DynamoDB
2. Update `/api/reviews-simple` to use Supabase (already does!)
3. Migrate existing DynamoDB reviews to Supabase (if any)
4. Remove DynamoDB code and credentials

**Migration Script:**
```typescript
// migrate-to-supabase.ts
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { supabaseAdmin } from './lib/supabase';

async function migrate() {
  // 1. Get all reviews from DynamoDB
  const dynamoClient = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.DB_ACCESS_KEY_ID!,
      secretAccessKey: process.env.DB_SECRET_ACCESS_KEY!,
    }
  });

  const { Items } = await dynamoClient.send(new ScanCommand({
    TableName: 'automagicly-reviews'
  }));

  const dynamoReviews = Items?.map(item => unmarshall(item)) || [];

  // 2. Insert into Supabase
  for (const review of dynamoReviews) {
    await supabaseAdmin.from('reviews').insert({
      name: review.name,
      email: review.email,
      company: review.company,
      rating: review.rating,
      review_text: review.reviewText || review.review_text,
      service_type: review.serviceType || review.service_type,
      status: review.status || 'pending',
      featured: review.featured || false,
      created_at: new Date(review.created_at).toISOString(),
      updated_at: new Date(review.updated_at || review.created_at).toISOString()
    });
  }

  console.log(`Migrated ${dynamoReviews.length} reviews to Supabase`);
}
```

---

### Option B: Use Only DynamoDB

**Advantages:**
- ✅ Already integrated with AWS Amplify
- ✅ Serverless, scales automatically
- ✅ Pay per use (can be cheaper at low volume)

**Disadvantages:**
- ❌ Loses email approval system (would need to rebuild)
- ❌ More complex queries
- ❌ No built-in auth features

**Changes Needed:**
1. Update `/api/reviews-old/*` to use DynamoDB instead of Supabase
2. Rebuild email approval system for DynamoDB
3. Migrate existing Supabase reviews to DynamoDB (if any)
4. Remove Supabase code and credentials

---

## Current State Summary

| Feature | Supabase | DynamoDB |
|---------|----------|----------|
| **Admin Dashboard** | ✅ Yes | ❌ No |
| **Email Approvals** | ✅ Yes | ❌ No |
| **Homepage Display** | ❌ No | ✅ Yes |
| **Review CRUD** | ✅ Yes | ⚠️ Partial |
| **Authentication** | ✅ Built-in | ❌ Manual |
| **Credentials Exposed** | ⚠️ Yes (need rotation) | ⚠️ Yes (rotated) |

---

## My Recommendation

**Use Supabase exclusively** because:

1. You already have the admin dashboard working with it
2. Email approval system is built for it
3. Free tier is sufficient for your needs
4. PostgreSQL is more powerful than DynamoDB for this use case
5. Better developer experience

**Quick Fix (5 minutes):**
Just change this one file to consolidate on Supabase:

```typescript
// app/api/reviews/route.ts
// Replace DynamoDB code with Supabase

import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Force approved status for non-authenticated users
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .gte('rating', 3)
    .order('created_at', { ascending: false });

  return NextResponse.json({ reviews });
}
```

Then you can:
- Delete `lib/db.ts` (DynamoDB code)
- Remove DynamoDB credentials from `.env`
- Delete the DynamoDB table (save costs)

---

**Would you like me to:**
1. ✅ Migrate everything to Supabase (recommended)
2. ❌ Migrate everything to DynamoDB
3. ⚠️ Keep both (not recommended)

Let me know and I can make the changes!
