#!/bin/bash

# Test Journal API endpoints
# Usage: ./test-journal-api.sh <auth-token>

if [ -z "$1" ]; then
  echo "Usage: ./test-journal-api.sh <auth-token>"
  echo "Get auth token by logging in and checking localStorage.getItem('authToken') in browser console"
  exit 1
fi

AUTH_TOKEN=$1
API_URL="https://lp3u3xe58k.execute-api.us-east-1.amazonaws.com/prod"

echo "🧪 Testing Journal API..."
echo "API URL: $API_URL"
echo ""

# Test 1: Create journal entry
echo "1️⃣ Creating journal entry..."
ENTRY_RESPONSE=$(curl -s -X POST "$API_URL/journal/entry" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "encryptedContent": "VGVzdCBqb3VybmFsIGVudHJ5IGZvciBBUEkgdGVzdGluZw==",
    "metadata": {
      "createdVia": "api-test",
      "wordCount": 6
    }
  }')

echo "Response: $ENTRY_RESPONSE"
ENTRY_ID=$(echo $ENTRY_RESPONSE | grep -o '"entryId":"[^"]*' | cut -d'"' -f4)
echo "Created entry ID: $ENTRY_ID"
echo ""

# Test 2: Get journal entries
echo "2️⃣ Getting journal entries..."
curl -s -X GET "$API_URL/journal/entries?limit=5" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

# Test 3: Process entry with AI (if entry created successfully)
if [ ! -z "$ENTRY_ID" ]; then
  echo "3️⃣ Processing entry with AI..."
  curl -s -X POST "$API_URL/journal/process" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"entryId\": \"$ENTRY_ID\",
      \"content\": \"Test journal entry for API testing. Feeling good about the progress!\"
    }" | jq '.'
  echo ""
fi

# Test 4: Search entries
echo "4️⃣ Testing search..."
curl -s -X POST "$API_URL/journal/search" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test",
    "limit": 5
  }' | jq '.'
echo ""

# Test 5: Get user context
echo "5️⃣ Getting user context..."
curl -s -X GET "$API_URL/journal/context" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

echo "✅ API tests complete!"