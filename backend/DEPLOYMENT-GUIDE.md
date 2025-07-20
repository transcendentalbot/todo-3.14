# Backend Deployment Guide

## Prerequisites

### 1. AWS Account Setup
- Create an AWS account at https://aws.amazon.com
- Set up an IAM user with programmatic access

### 2. Required IAM Permissions
Your IAM user needs these permissions:
- IAMFullAccess (for creating roles)
- AWSLambdaFullAccess
- AmazonAPIGatewayAdministrator
- AmazonDynamoDBFullAccess
- AmazonS3FullAccess
- CloudFormationFullAccess

### 3. Configure AWS CLI
```bash
# Install AWS CLI if not already installed
# On macOS:
brew install awscli

# Configure credentials
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: us-east-1
- Default output format: json

### 4. Install Serverless Framework
```bash
npm install -g serverless
```

## Deployment Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Deploy to AWS
```bash
# Deploy to dev stage (default)
npm run deploy

# Or use serverless directly
serverless deploy

# For production
serverless deploy --stage prod
```

## Common Errors and Solutions

### Error: "The security token included in the request is invalid"
**Solution:** Your AWS credentials are not configured properly.
```bash
aws configure list  # Check current config
aws configure      # Reconfigure
```

### Error: "User is not authorized to perform: iam:CreateRole"
**Solution:** Your IAM user needs more permissions. Add the required policies listed above.

### Error: "Stack already exists"
**Solution:** The stack name is already in use.
```bash
# Remove the existing stack
serverless remove

# Then deploy again
serverless deploy
```

### Error: "Bucket name already exists"
**Solution:** S3 bucket names must be globally unique. Update the bucket name in serverless.yml:
```yaml
PhotosBucket:
  Properties:
    BucketName: ${self:service}-photos-${self:provider.stage}-${aws:accountId}
```

### Error: "ENOENT: no such file or directory"
**Solution:** TypeScript compilation issue.
```bash
# Clean and rebuild
rm -rf .build .serverless
npm run deploy
```

## Verify Deployment

After successful deployment, you'll see output like:
```
Service Information
service: wellness-companion
stage: dev
region: us-east-1
stack: wellness-companion-dev
resources: 35
api keys:
  None
endpoints:
  POST - https://xxxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/register
  POST - https://xxxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/login
  ...
```

Save the API endpoint URL to use in the frontend .env file.

## Local Testing First

Before deploying, test locally:
```bash
npm run local
```

This starts serverless-offline on http://localhost:3001