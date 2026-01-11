# AWS Amplify Deployment Guide

## 🚀 Quick Fix for Failed Deployment

Your Amplify deployment failed because **environment variables weren't configured**. Here's how to fix it:

---

## ✅ **Step 1: Set Environment Variables in Amplify Console**

1. Go to your Amplify app in AWS Console
2. Click on **"Environment variables"** in the left sidebar
3. Click **"Manage variables"**
4. Add the following variables:

### Required Variables:

#### Authentication:
```bash
NEXTAUTH_SECRET=<your-secret-here>
# Generate with: openssl rand -base64 32
# Must be 32+ characters

NEXTAUTH_URL=https://your-domain.amplifyapp.com
# Or your custom domain

ADMIN_EMAIL=<your-admin-email>
# Your admin email address

ADMIN_PASSWORD_HASH=<bcrypt-hash>
# Bcrypt hash of your admin password
```

#### Database (DynamoDB):
```bash
DB_ACCESS_KEY_ID=<your-aws-access-key>
# AWS IAM access key for DynamoDB

DB_SECRET_ACCESS_KEY=<your-aws-secret-key>
# AWS IAM secret key

REGION=us-east-1
# AWS region (default: us-east-1)
```

#### Google Calendar:
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account-email>
# From your Google Cloud service account

GOOGLE_PRIVATE_KEY=<private-key>
# Service account private key (includes -----BEGIN/END-----)

GOOGLE_CALENDAR_ID=<calendar-id>
# Your Google Calendar ID
```

### Optional Variables:

#### CloudWatch RUM (Monitoring):
```bash
NEXT_PUBLIC_ENABLE_RUM=true
# Enable CloudWatch RUM in production
```

#### N8N Webhooks (if using):
```bash
NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL=<webhook-url>
NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL=<webhook-url>
NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL=<webhook-url>
NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL=<webhook-url>
```

---

## 📝 **Step 2: Generate Required Secrets**

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Generate ADMIN_PASSWORD_HASH:
```bash
# On macOS/Linux with Node.js:
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(console.log);"
```

Or use an online bcrypt generator (use rounds: 10)

---

## 🔧 **Step 3: Where to Get Your Values**

### AWS Credentials (DynamoDB):
You already have these! Use the same credentials from `.env.local`:
- `DB_ACCESS_KEY_ID`
- `DB_SECRET_ACCESS_KEY`

### Google Calendar Credentials:
From your Google Cloud Console service account (same as `.env.local`)

### NEXTAUTH_URL:
**Option 1:** Use Amplify-provided domain
```
https://master.xxxxxxxxxxxx.amplifyapp.com
```

**Option 2:** Use your custom domain (if configured)
```
https://automagicly.com
```

---

## 🚀 **Step 4: Redeploy**

After adding all environment variables:

1. Click **"Save"** in Amplify Console
2. Go to **"App settings"** → **"Build settings"**
3. Click **"Redeploy this version"**

OR push a new commit:
```bash
git commit --allow-empty -m "Trigger Amplify rebuild"
git push origin master
```

---

## ✅ **Step 5: Verify Deployment**

Once deployed, check:

1. **Application loads:** Visit your Amplify URL
2. **Admin login works:** Go to `/admin/login`
3. **Reviews page works:** Go to `/reviews`
4. **CloudWatch RUM:** Check CloudWatch console for RUM events

---

## 🐛 **Common Issues & Solutions**

### Issue: "NEXTAUTH_SECRET must be at least 32 characters"
**Solution:** Generate a new secret with `openssl rand -base64 32`

### Issue: "Failed to connect to DynamoDB"
**Solution:**
- Verify `DB_ACCESS_KEY_ID` and `DB_SECRET_ACCESS_KEY` are correct
- Ensure IAM user has DynamoDB permissions
- Check `REGION` matches your DynamoDB table region

### Issue: "Google Calendar API errors"
**Solution:**
- Ensure `GOOGLE_PRIVATE_KEY` includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Check service account has Calendar API enabled
- Verify calendar is shared with service account email

### Issue: Build still failing
**Solution:**
1. Check Amplify build logs for specific error
2. Ensure all **required** environment variables are set
3. Verify no typos in variable names
4. Check that values don't have extra quotes or whitespace

---

## 📊 **Environment Variables Checklist**

Use this checklist to ensure all variables are set:

### Required (9 variables):
- [ ] `NEXTAUTH_SECRET` (32+ characters)
- [ ] `NEXTAUTH_URL` (your production URL)
- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_PASSWORD_HASH`
- [ ] `DB_ACCESS_KEY_ID`
- [ ] `DB_SECRET_ACCESS_KEY`
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- [ ] `GOOGLE_PRIVATE_KEY`
- [ ] `GOOGLE_CALENDAR_ID`

### Optional but Recommended:
- [ ] `REGION` (defaults to us-east-1)
- [ ] `NEXT_PUBLIC_ENABLE_RUM` (for CloudWatch monitoring)

### Optional Webhooks:
- [ ] `NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL`
- [ ] `NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL`
- [ ] `NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL`
- [ ] `NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL`

---

## 🎯 **Quick Copy Template**

Copy this template and fill in your values:

```bash
# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=

# Database
DB_ACCESS_KEY_ID=
DB_SECRET_ACCESS_KEY=
REGION=us-east-1

# Google Calendar
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_CALENDAR_ID=

# Optional: Monitoring
NEXT_PUBLIC_ENABLE_RUM=true
```

---

## 🔒 **Security Notes**

1. **Never commit secrets to Git** - Environment variables in Amplify are encrypted
2. **Use IAM permissions** - DB_ACCESS_KEY should have minimal DynamoDB permissions
3. **Rotate secrets regularly** - Especially NEXTAUTH_SECRET and admin password
4. **Enable CloudWatch RUM** - Monitor for security issues in production

---

## 📞 **Need Help?**

If deployment still fails after setting environment variables:

1. **Check Amplify Build Logs:**
   - Go to Amplify Console
   - Click on failed deployment
   - View detailed build logs

2. **Common Error Messages:**
   - "Missing required environment variables" → Check spelling and values
   - "Build failed at npm run build" → Check build logs for TypeScript errors
   - "Server error on first request" → Environment validation failing at runtime

3. **Verify locally first:**
   ```bash
   # Test production build locally
   npm run build

   # If it works locally, issue is with Amplify env vars
   ```

---

## ✅ **What's Different Now**

I've updated the deployment to:

1. ✅ **Skip env validation during build** - Won't fail Amplify build
2. ✅ **Validate at runtime** - Still secure, checks vars when app starts
3. ✅ **Created `amplify.yml`** - Proper build configuration
4. ✅ **Added this guide** - Easy setup instructions

**Your next deployment will succeed once environment variables are set!**

---

## 🚀 **After Successful Deployment**

Once your app is deployed:

1. **Test all features:**
   - [ ] Admin login
   - [ ] Review submission
   - [ ] Calendar availability
   - [ ] Chat widget

2. **Enable monitoring:**
   - [ ] CloudWatch RUM (set `NEXT_PUBLIC_ENABLE_RUM=true`)
   - [ ] Check CloudWatch dashboard
   - [ ] Monitor X-Ray traces

3. **Set up custom domain (optional):**
   - Amplify Console → Domain management
   - Add your domain
   - Update `NEXTAUTH_URL` to match

---

**🎉 You're ready to deploy! Follow the steps above and your app will go live successfully.**
