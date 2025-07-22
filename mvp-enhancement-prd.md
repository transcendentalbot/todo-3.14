# MVP Enhancement PRD - Notifications & Encryption

## Current State
- ✅ Backend: Serverless Framework, Lambda, DynamoDB, Cognito
- ✅ Frontend: React PWA with voice input and photo capture
- ✅ Authentication: Working with JWT tokens
- ❌ Push notifications not implemented
- ❌ Data stored in plaintext in DynamoDB
- ❌ No reminder/alert system active

## Required Changes Only

### 1. Push Notifications (Priority 1)

**Backend Changes:**
- Add new Lambda function: `notificationHandler`
- Add DynamoDB field to users table: `pushSubscription`
- Install dependencies: `web-push`
- Add environment variables: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`

**Frontend Changes:**
- Update service worker to handle push events
- Add notification permission request after login
- Create `NotificationService` class
- Add notification subscription to user profile

**Implementation:**
1. Generate VAPID keys
2. Add push subscription endpoint to API
3. Update service worker with notification handlers
4. Add UI for permission request
5. Test on iOS 16.4+ and Android

### 2. SMS Backup (Priority 2)

**Backend Changes:**
- Add AWS SNS configuration to serverless.yml
- Add phone number to user registration
- Create `sendSMS` utility function
- Add SMS fallback to notification handler

**Cost:** ~$0.01 per SMS (only for critical alerts)

### 3. Client-Side Encryption (Priority 1)

**Frontend Changes:**
- Install `crypto-js`
- Create `EncryptionService` class
- Wrap all API calls with encryption layer
- Add password-derived key generation
- Store only salt in localStorage

**Backend Changes:**
- Update DynamoDB schema: rename `data` field to `encryptedData`
- Remove any data validation/parsing in Lambda
- Update all endpoints to handle encrypted blobs only

**Migration:**
- Existing plaintext data will need manual migration or deletion
- Add migration warning for existing users

### 4. Notification Schedule

**Backend Changes:**
- Add EventBridge rules for scheduled notifications:
  - 7 AM: Morning check-in
  - 12 PM: Lunch reminder
  - 6 PM: Supplement reminder
  - 9 PM: Evening reflection
- Add Lambda function: `scheduledNotificationTrigger`

### 5. Quick Actions from Notifications

**Frontend Changes:**
- Add notification action handlers in service worker
- Create quick-complete API endpoint
- Add snooze functionality (10-minute delay)

## API Changes

### New Endpoints:
```
POST /api/notifications/subscribe
{
  subscription: PushSubscription,
  phone?: string
}

POST /api/tracking/quick-complete
{
  type: 'supplement' | 'checkin',
  timestamp: number
}
```

### Modified Endpoints:
All existing endpoints now expect encrypted payloads:
```
POST /api/tracking/*
{
  timestamp: number,
  encryptedData: string  // Was 'data' object
}
```

## Database Changes

### Users Table:
Add fields:
- `pushSubscription`: JSON
- `phone`: String (optional)
- `notificationPreferences`: JSON

### Tracking Table:
Rename field:
- `data` → `encryptedData`

## Deployment Steps

1. **Backend First:**
   - Deploy encryption support
   - Add notification endpoints
   - Update environment variables

2. **Frontend Second:**
   - Add encryption service
   - Update all API calls
   - Deploy service worker changes

3. **Testing:**
   - Verify encryption works
   - Test push notifications on real devices
   - Verify SMS fallback

## Success Criteria

- Push notifications work on iOS/Android PWA
- All data encrypted before leaving device
- SMS backup triggers for failed critical alerts
- Zero plaintext user data in database
- Existing features continue working

## Timeline

- Week 1: Encryption + updated API
- Week 2: Push notifications + service worker
- Week 3: SMS backup + scheduled notifications
- Week 4: Testing and refinement

## Risks

1. **iOS PWA Limitations**: User must add to home screen first
2. **Migration**: Existing users lose data if they don't save it
3. **Key Loss**: No password recovery possible with encryption

## No Changes To

- Authentication flow (stays with Cognito)
- Basic app functionality
- UI/UX design
- Database structure (except field names)
- Deployment process