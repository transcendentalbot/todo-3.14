# Deployment Guide - Wellness Companion

## Current Deployment Status

### ✅ AWS Backend Resources Created:
- **Cognito User Pool ID**: `us-east-1_fTxU26uy4`
- **Cognito Client ID**: `3i8iauebg4sseeh6qdlstncmh9`
- **API Gateway URL**: `https://gmb7o66agi.execute-api.us-east-1.amazonaws.com/dev`
- **DynamoDB Tables**: 
  - wellness-companion-users-dev
  - wellness-companion-tracking-dev
  - wellness-companion-reminders-dev
- **S3 Bucket**: wellness-companion-photos-dev-{accountId}

### ✅ GitHub Actions Workflow Created:
- Location: `.github/workflows/deploy.yml`
- Triggers on push to main branch
- Deploys backend to AWS, then frontend to Vercel

## Required GitHub Secrets

Run the setup script to see all required secrets:
```bash
./setup-github-secrets.sh
```

Or set them manually in your GitHub repository settings:

```
AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
COGNITO_USER_POOL_ID=us-east-1_fTxU26uy4
COGNITO_CLIENT_ID=3i8iauebg4sseeh6qdlstncmh9
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=transcendentals-projects
VERCEL_PROJECT_ID=prj_kboSSJvs65J28yoJDCJpeG4j1tTq
```

## Deployment Process

### Manual Deployment:

1. **Backend (AWS)**:
   ```bash
   cd backend
   serverless deploy --stage dev
   ```

2. **Frontend (Vercel)**:
   ```bash
   cd frontend
   vercel --prod
   ```

### Automatic Deployment via GitHub Actions:

1. Set up all GitHub secrets listed above
2. Push to main branch
3. GitHub Actions will automatically:
   - Deploy backend to AWS
   - Get the API URL
   - Deploy frontend to Vercel with correct environment variables

## Local Development

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev  # If serverless-offline is configured
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment Variables

### Frontend (.env.local):
```env
VITE_API_URL=https://gmb7o66agi.execute-api.us-east-1.amazonaws.com/dev
VITE_COGNITO_USER_POOL_ID=us-east-1_fTxU26uy4
VITE_COGNITO_CLIENT_ID=3i8iauebg4sseeh6qdlstncmh9
```

### Backend (serverless.yml):
All environment variables are configured in the serverless.yml file and deployed with the stack.

## Monitoring

- **CloudWatch Logs**: Check AWS CloudWatch for Lambda function logs
- **API Gateway Logs**: Available in AWS Console under API Gateway
- **DynamoDB Metrics**: Monitor table usage in AWS Console

## Next Steps

1. Set up GitHub secrets using the provided script
2. Push code to trigger deployment
3. Test the deployed application
4. Configure custom domain (optional)
5. Set up monitoring and alerts