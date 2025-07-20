#!/bin/bash

# GitHub Secrets Setup Script for Wellness Companion

echo "=== GitHub Secrets Setup ==="
echo "Run these commands to set up your GitHub secrets:"
echo ""

# AWS Secrets
echo "# AWS Credentials"
echo "gh secret set AWS_ACCESS_KEY_ID --body '<your-aws-access-key-id>'"
echo "gh secret set AWS_SECRET_ACCESS_KEY --body '<your-aws-secret-access-key>'"
echo ""

# Cognito Secrets
echo "# Cognito Configuration"
echo "gh secret set COGNITO_USER_POOL_ID --body 'us-east-1_fTxU26uy4'"
echo "gh secret set COGNITO_CLIENT_ID --body '3i8iauebg4sseeh6qdlstncmh9'"
echo ""

# Vercel Secrets
echo "# Vercel Configuration"
echo "gh secret set VERCEL_TOKEN --body '<your-vercel-token>'"
echo "gh secret set VERCEL_ORG_ID --body 'transcendentals-projects'"
echo "gh secret set VERCEL_PROJECT_ID --body 'prj_kboSSJvs65J28yoJDCJpeG4j1tTq'"
echo ""

echo "=== Summary of All Required Secrets ==="
echo ""
echo "AWS_ACCESS_KEY_ID=<your-aws-access-key-id>"
echo "AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>"
echo "COGNITO_USER_POOL_ID=us-east-1_fTxU26uy4"
echo "COGNITO_CLIENT_ID=3i8iauebg4sseeh6qdlstncmh9"
echo "VERCEL_TOKEN=<your-vercel-token>"
echo "VERCEL_ORG_ID=transcendentals-projects"
echo "VERCEL_PROJECT_ID=prj_kboSSJvs65J28yoJDCJpeG4j1tTq"
echo ""
echo "API Gateway URL: https://gmb7o66agi.execute-api.us-east-1.amazonaws.com/dev"
echo ""