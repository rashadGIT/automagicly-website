#!/bin/bash
# ============================================================================
# AWS Amplify Test Branch Environment Variables Setup
# ============================================================================
# This script configures the test branch to use production n8n webhooks
# while maintaining separate NEXTAUTH configuration
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}AWS Amplify Test Environment Setup${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo ""

# Configuration
APP_ID="d8lyv49zhamke"
BRANCH_NAME="test"
ENV_FILE=".env.production"

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}ERROR: $ENV_FILE not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Loading values from $ENV_FILE...${NC}"

# Source the .env.production file
set -a  # automatically export all variables
source "$ENV_FILE"
set +a

echo -e "${GREEN}✓ Loaded environment variables${NC}"
echo ""

# Generate new NEXTAUTH_SECRET for test
echo -e "${YELLOW}Step 2: Generating new NEXTAUTH_SECRET for test environment...${NC}"
TEST_NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✓ Generated NEXTAUTH_SECRET: ${TEST_NEXTAUTH_SECRET:0:10}...${NC}"
echo ""

# Update n8n chat webhook URL (fix placeholder)
if [[ "$N8N_CHAT_WEBHOOK_URL" == *"your-n8n-instance"* ]]; then
    echo -e "${YELLOW}Updating N8N_CHAT_WEBHOOK_URL to production endpoint...${NC}"
    N8N_CHAT_WEBHOOK_URL="https://rashadbarnett.app.n8n.cloud/webhook/chat"
fi

# Missing variables that need to be set
NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL="https://rashadbarnett.app.n8n.cloud/webhook/audit-ai"
N8N_CHAT_API_KEY="9e9b75e99e1883418181ed35b3cc61a4594cd768022a49d8e65eee36d738071b"
N8N_AUDIT_EMAIL_WEBHOOK_URL="https://rashadbarnett.app.n8n.cloud/webhook/audit-email-results"
NEXT_PUBLIC_ADMIN_PASSWORD="your-admin-password-here"

echo -e "${YELLOW}Step 3: Preparing environment variables JSON...${NC}"

# Create JSON for environment variables
# Note: AWS Amplify expects a flat object with key-value pairs
cat > /tmp/test-env-vars.json <<EOF
{
  "NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL": "${NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL}",
  "NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL": "${NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL}",
  "NEXT_PUBLIC_N8N_REVIEW_GENERATOR_WEBHOOK_URL": "${NEXT_PUBLIC_N8N_REVIEW_GENERATOR_WEBHOOK_URL}",
  "NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL": "${NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL}",
  "NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL": "${NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL}",
  "NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL": "${NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL}",
  "N8N_CHAT_WEBHOOK_URL": "${N8N_CHAT_WEBHOOK_URL}",
  "N8N_CHAT_API_KEY": "${N8N_CHAT_API_KEY}",
  "N8N_AUDIT_EMAIL_WEBHOOK_URL": "${N8N_AUDIT_EMAIL_WEBHOOK_URL}",
  "NEXTAUTH_URL": "https://test.automagicly.ai",
  "NEXTAUTH_SECRET": "${TEST_NEXTAUTH_SECRET}",
  "ADMIN_EMAIL": "${ADMIN_EMAIL}",
  "ADMIN_PASSWORD_HASH": "${ADMIN_PASSWORD_HASH}",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL": "${GOOGLE_SERVICE_ACCOUNT_EMAIL}",
  "GOOGLE_PRIVATE_KEY": "${GOOGLE_PRIVATE_KEY}",
  "GOOGLE_CALENDAR_ID": "${GOOGLE_CALENDAR_ID}",
  "NEXT_PUBLIC_SUPABASE_URL": "${NEXT_PUBLIC_SUPABASE_URL}",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY": "${NEXT_PUBLIC_SUPABASE_ANON_KEY}",
  "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}",
  "DB_ACCESS_KEY_ID": "${DB_ACCESS_KEY_ID}",
  "DB_SECRET_ACCESS_KEY": "${DB_SECRET_ACCESS_KEY}",
  "REGION": "${REGION}",
  "NEXT_PUBLIC_ADMIN_PASSWORD": "${NEXT_PUBLIC_ADMIN_PASSWORD}"
}
EOF

echo -e "${GREEN}✓ Environment variables JSON created${NC}"
echo ""

echo -e "${YELLOW}Step 4: Updating AWS Amplify test branch environment variables...${NC}"
echo -e "${YELLOW}App ID: $APP_ID${NC}"
echo -e "${YELLOW}Branch: $BRANCH_NAME${NC}"
echo ""

# Update the branch with environment variables
aws amplify update-branch \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH_NAME" \
  --environment-variables file:///tmp/test-env-vars.json \
  --output json > /tmp/amplify-update-result.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully updated environment variables!${NC}"
    echo ""

    # Show result summary
    echo -e "${GREEN}==================================================================${NC}"
    echo -e "${GREEN}Environment Variables Set for Test Branch:${NC}"
    echo -e "${GREEN}==================================================================${NC}"
    echo ""
    echo "n8n Webhooks (Production endpoints):"
    echo "  ✓ NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL"
    echo "  ✓ NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL"
    echo "  ✓ NEXT_PUBLIC_N8N_REVIEW_GENERATOR_WEBHOOK_URL"
    echo "  ✓ NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL"
    echo "  ✓ NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL"
    echo "  ✓ NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL"
    echo "  ✓ N8N_CHAT_WEBHOOK_URL"
    echo "  ✓ N8N_CHAT_API_KEY"
    echo "  ✓ N8N_AUDIT_EMAIL_WEBHOOK_URL"
    echo ""
    echo "Authentication (Test-specific):"
    echo "  ✓ NEXTAUTH_URL = https://test.automagicly.ai"
    echo "  ✓ NEXTAUTH_SECRET = (generated)"
    echo ""
    echo "Shared Resources:"
    echo "  ✓ Google Calendar credentials"
    echo "  ✓ Supabase credentials"
    echo "  ✓ DynamoDB credentials"
    echo "  ✓ Admin credentials"
    echo ""
    echo -e "${GREEN}==================================================================${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. AWS Amplify will automatically redeploy the test branch"
    echo "2. Monitor deployment: https://console.aws.amazon.com/amplify/home?region=us-east-1#/$APP_ID"
    echo "3. After deployment, verify configuration:"
    echo "   Visit: https://test.automagicly.ai/api/debug-n8n"
    echo "4. Test all features:"
    echo "   - Chat widget"
    echo "   - AI Business Audit"
    echo "   - Custom booking"
    echo "   - Reviews form"
    echo ""
    echo -e "${GREEN}IMPORTANT: Save your NEXTAUTH_SECRET!${NC}"
    echo "NEXTAUTH_SECRET for test environment: ${TEST_NEXTAUTH_SECRET}"
    echo ""
    echo "Store this in your password manager or secure location."
    echo ""

    # Save NEXTAUTH_SECRET to a file
    echo "$TEST_NEXTAUTH_SECRET" > .nextauth-secret-test.txt
    echo -e "${YELLOW}✓ NEXTAUTH_SECRET also saved to: .nextauth-secret-test.txt${NC}"
    echo -e "${RED}⚠️  Add .nextauth-secret-test.txt to .gitignore!${NC}"
    echo ""

else
    echo -e "${RED}ERROR: Failed to update environment variables!${NC}"
    echo "Check the error message above and try again."
    exit 1
fi

# Cleanup
rm /tmp/test-env-vars.json

echo -e "${GREEN}Setup complete!${NC}"
