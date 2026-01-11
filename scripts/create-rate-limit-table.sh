#!/bin/bash

# Create DynamoDB table for rate limiting
# This replaces the in-memory Map with persistent, distributed rate limiting

AWS_REGION="${AWS_REGION:-us-east-1}"

echo "Creating DynamoDB rate limiting table in region: $AWS_REGION"

aws dynamodb create-table \
  --table-name automagicly-rate-limits \
  --attribute-definitions \
    AttributeName=identifier,AttributeType=S \
  --key-schema \
    AttributeName=identifier,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$AWS_REGION" \
  --tags \
    Key=Project,Value=AutoMagicly \
    Key=Purpose,Value=RateLimiting

echo "Waiting for table to be active..."
aws dynamodb wait table-exists \
  --table-name automagicly-rate-limits \
  --region "$AWS_REGION"

echo "Enabling TTL on expiresAt attribute..."
aws dynamodb update-time-to-live \
  --table-name automagicly-rate-limits \
  --time-to-live-specification "Enabled=true,AttributeName=expiresAt" \
  --region "$AWS_REGION"

echo "✅ Rate limiting table created successfully!"
echo ""
echo "Table details:"
aws dynamodb describe-table \
  --table-name automagicly-rate-limits \
  --region "$AWS_REGION" \
  --query 'Table.[TableName,TableStatus,ItemCount]' \
  --output text
