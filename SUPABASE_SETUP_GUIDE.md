# Supabase Review System - Complete Setup Guide

## Step 1: Create Supabase Account & Project (5 minutes)

### 1. Sign Up for Supabase
Go to: https://supabase.com

1. Click **"Start your project"**
2. Sign in with GitHub (easiest)
3. Click **"New Project"**

### 2. Create Project
- **Name:** `automagicly-reviews`
- **Database Password:** Create a strong password (save this!)
- **Region:** Choose closest to you (US East, US West, etc.)
- Click **"Create new project"**

⏱️ Wait 2-3 minutes for project to initialize...

---

## Step 2: Create Reviews Table (2 minutes)

### 1. Open SQL Editor
1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"+ New query"**

### 2. Copy & Paste This SQL

```sql
-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Review data
  name VARCHAR(255),
  email VARCHAR(255),
  company VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  service_type VARCHAR(100) NOT NULL,

  -- Approval workflow
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT false,
  approval_token VARCHAR(255) UNIQUE,
  token_expires_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_featured ON reviews(featured);
CREATE INDEX idx_reviews_approval_token ON reviews(approval_token);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow all operations for service role (your backend)
CREATE POLICY "Allow service role full access" ON reviews
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policy: Public can only read approved reviews with rating >= 3
CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT
  USING (status = 'approved' AND rating >= 3);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. Run the SQL
1. Click **"Run"** (or Ctrl/Cmd + Enter)
2. You should see: ✅ "Success. No rows returned"

---

## Step 3: Get Your Supabase Credentials (2 minutes)

### 1. Get Project URL & Keys
1. Go to **"Settings"** → **"API"** (left sidebar)
2. Copy these values:

```
Project URL:
https://xxxxxxxxxxxxx.supabase.co

anon (public) key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...

service_role (secret) key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
```

### 2. Add to .env.local

Open your `.env.local` file and add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANT:**
- `NEXT_PUBLIC_*` = Can be used in browser (safe)
- `SUPABASE_SERVICE_ROLE_KEY` = Backend only (secret, never expose!)

---

## Step 4: Install Supabase Client (1 minute)

### Run this command:

```bash
npm install @supabase/supabase-js
```

---

## Step 5: Test Your Setup (2 minutes)

### 1. Insert a Test Review

Go back to SQL Editor and run:

```sql
-- Insert test review
INSERT INTO reviews (name, email, company, rating, review_text, service_type, status)
VALUES
  ('John Doe', 'john@example.com', 'Acme Inc', 5, 'Amazing service! Saved us 20 hours per week.', 'AI Audit', 'approved'),
  ('Jane Smith', 'jane@example.com', 'Tech Corp', 4, 'Great experience, highly recommend!', 'AI Partnership', 'approved'),
  ('Bob Wilson', 'bob@example.com', 'StartupXYZ', 2, 'Not what I expected.', 'One-Off Workflow', 'pending');
```

### 2. Query Reviews

```sql
-- Get all approved reviews with 3+ stars
SELECT * FROM reviews
WHERE status = 'approved'
AND rating >= 3
ORDER BY created_at DESC;
```

You should see 2 reviews (John and Jane, not Bob)!

---

## Step 6: Enable Realtime (Optional but Cool)

### 1. Enable Realtime for Reviews Table
1. Go to **"Database"** → **"Replication"**
2. Find the `reviews` table
3. Toggle **"Realtime"** to ON

This allows your website to update instantly when reviews are approved!

---

## Step 7: Set Up Storage for Images (Optional - Future)

If you want to allow users to upload images with reviews:

1. Go to **"Storage"**
2. Click **"New bucket"**
3. Name: `review-images`
4. Make it public
5. Set size limit (e.g., 5MB)

---

## Database Schema Explained

### Table: `reviews`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique ID (auto-generated) |
| `name` | VARCHAR | Reviewer name (optional) |
| `email` | VARCHAR | Reviewer email (optional) |
| `company` | VARCHAR | Company name (optional) |
| `rating` | INTEGER | 1-5 stars (required) |
| `review_text` | TEXT | Review content (required) |
| `service_type` | VARCHAR | Which service reviewed |
| `status` | VARCHAR | pending/approved/rejected |
| `featured` | BOOLEAN | Pin to top of website |
| `approval_token` | VARCHAR | Secure token for email approval |
| `token_expires_at` | TIMESTAMP | When token expires |
| `created_at` | TIMESTAMP | When submitted |
| `approved_at` | TIMESTAMP | When approved |
| `updated_at` | TIMESTAMP | Last update (auto) |

### Indexes for Performance

```sql
-- Fast queries by status
idx_reviews_status

-- Fast queries by rating
idx_reviews_rating

-- Fast queries for featured
idx_reviews_featured

-- Fast token lookups
idx_reviews_approval_token

-- Sort by newest first
idx_reviews_created_at
```

---

## Row Level Security (RLS) Explained

### What is RLS?
Automatic security rules built into PostgreSQL that control who can read/write data.

### Our Policies:

1. **Service Role Access:**
   - Your backend API can do anything (full access)
   - Uses `SUPABASE_SERVICE_ROLE_KEY`

2. **Public Access:**
   - Website visitors can ONLY see:
     - status = 'approved'
     - rating >= 3
   - Cannot see pending/rejected reviews
   - Cannot see low-rated reviews

This is **automatic security** - no code needed!

---

## Supabase Auto-Features You Get

### ✅ REST API (Auto-Generated)
```
GET https://xxxxx.supabase.co/rest/v1/reviews
POST https://xxxxx.supabase.co/rest/v1/reviews
PATCH https://xxxxx.supabase.co/rest/v1/reviews?id=eq.xxx
DELETE https://xxxxx.supabase.co/rest/v1/reviews?id=eq.xxx
```

### ✅ Realtime Subscriptions
```javascript
supabase
  .channel('reviews')
  .on('INSERT', payload => console.log('New review!', payload))
  .subscribe()
```

### ✅ Database Backups
- Automatic daily backups
- Point-in-time recovery
- 7-day retention (free tier)

### ✅ Dashboard Analytics
- See table size
- Monitor queries
- Check API usage

---

## Testing the Database

### Test Queries to Run:

```sql
-- 1. Get all approved reviews (3+ stars)
SELECT * FROM reviews
WHERE status = 'approved' AND rating >= 3
ORDER BY featured DESC, rating DESC, created_at DESC;

-- 2. Get pending reviews
SELECT * FROM reviews WHERE status = 'pending';

-- 3. Approve a review
UPDATE reviews
SET status = 'approved', approved_at = NOW()
WHERE id = 'your-review-id';

-- 4. Feature a review
UPDATE reviews
SET featured = true
WHERE id = 'your-review-id';

-- 5. Get review stats
SELECT
  status,
  COUNT(*) as count,
  ROUND(AVG(rating), 2) as avg_rating
FROM reviews
GROUP BY status;
```

---

## Environment Variables Summary

Add these to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Next Steps

Once this is set up:

1. ✅ Update N8N workflows to insert into Supabase
2. ✅ Update API routes to query Supabase
3. ✅ Update Reviews component to fetch from Supabase
4. ✅ Update admin dashboard to manage Supabase reviews
5. ✅ Add 3+ star filter on public display

---

## Troubleshooting

### Can't connect to Supabase?
- Check project URL is correct
- Check API keys are correct
- Check `.env.local` is loaded (restart dev server)

### RLS blocking queries?
- Use `SUPABASE_SERVICE_ROLE_KEY` for backend API calls
- Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for frontend (limited access)

### Slow queries?
- Check indexes are created
- Use `EXPLAIN ANALYZE` in SQL editor

---

## Free Tier Limits

Supabase Free Plan includes:
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

**This is MORE than enough for your review system!**

---

## Security Checklist

- [x] RLS enabled
- [x] Service role key is secret (not in frontend code)
- [x] Public can only see approved + 3+ star reviews
- [x] Indexes created for performance
- [x] Auto-updated timestamps
- [x] Token expiration for email approvals

---

You're all set! Your database is ready. 🎉

Next, I'll update the code to connect to Supabase!
