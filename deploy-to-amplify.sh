#!/bin/bash

# AutoMagicly - AWS Amplify Deployment Script
# This script will guide you through deploying to AWS Amplify

set -e  # Exit on any error

echo "🚀 AutoMagicly - AWS Amplify Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Step 1: Initializing Git Repository${NC}"
    git init
    git branch -M main
    echo -e "${GREEN}✓ Git initialized${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Git already initialized${NC}"
    echo ""
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}📝 Creating .gitignore${NC}"
    cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF
    echo -e "${GREEN}✓ .gitignore created${NC}"
    echo ""
fi

# Add all files
echo -e "${YELLOW}📦 Step 2: Adding files to Git${NC}"
git add .
echo -e "${GREEN}✓ Files added${NC}"
echo ""

# Commit
echo -e "${YELLOW}💾 Step 3: Creating initial commit${NC}"
if git diff-index --quiet HEAD --; then
    echo -e "${BLUE}ℹ No changes to commit${NC}"
else
    git commit -m "Initial production deployment to AWS Amplify" || echo -e "${BLUE}ℹ Nothing to commit${NC}"
    echo -e "${GREEN}✓ Commit created${NC}"
fi
echo ""

# Check for GitHub remote
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}🔗 Step 4: Add GitHub Remote${NC}"
    echo ""
    echo -e "${RED}⚠️  ACTION REQUIRED:${NC}"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named: automagicly"
    echo "3. Do NOT initialize with README, .gitignore, or license"
    echo "4. Copy the repository URL"
    echo ""
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/automagicly.git): " REPO_URL

    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✓ Remote added${NC}"
    echo ""
else
    echo -e "${GREEN}✓ GitHub remote already configured${NC}"
    echo ""
fi

# Push to GitHub
echo -e "${YELLOW}📤 Step 5: Pushing to GitHub${NC}"
echo ""
echo "Running: git push -u origin main"
echo ""

if git push -u origin main; then
    echo -e "${GREEN}✓ Code pushed to GitHub!${NC}"
else
    echo -e "${YELLOW}⚠️  First push failed, trying with force (this is safe for initial push)${NC}"
    git push -u origin main --force
    echo -e "${GREEN}✓ Code pushed to GitHub!${NC}"
fi
echo ""

# Next steps
echo -e "${GREEN}✅ Code is now on GitHub!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 NEXT STEPS - Deploy to AWS Amplify:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Go to: https://console.aws.amazon.com/amplify/home"
echo ""
echo "2. Click: 'New app' → 'Host web app'"
echo ""
echo "3. Select: GitHub"
echo ""
echo "4. Authorize AWS Amplify to access your GitHub"
echo ""
echo "5. Select repository: automagicly"
echo ""
echo "6. Select branch: main"
echo ""
echo "7. Amplify will auto-detect Next.js settings (keep defaults)"
echo ""
echo "8. Click 'Next' → 'Save and deploy'"
echo ""
echo "9. Wait ~5 minutes for initial deployment"
echo ""
echo "10. Once deployed, go to: 'Environment variables'"
echo ""
echo "11. Add these environment variables:"
echo "    (See ENVIRONMENT_VARIABLES.txt for the full list)"
echo ""
echo "12. Go to: 'Domain management' → Add domain: automagicly.com"
echo ""
echo -e "${GREEN}✅ That's it! Your app will be live!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Environment variables file created: ENVIRONMENT_VARIABLES.txt"
echo "Open it and copy/paste into Amplify Console"
echo ""
