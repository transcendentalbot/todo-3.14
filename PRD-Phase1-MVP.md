# Phase 1 MVP - Product Requirements Document
## Wellness Companion - 10 Week Implementation Plan

### Phase 1 Objective
Build a functional PWA with core tracking features, voice input, and basic reminders that works reliably on mobile devices.

### Week 1-2: Foundation & Backend

#### Backend Infrastructure (AWS)
- [x] AWS Account setup with proper IAM roles
- [x] API Gateway configuration
- [x] Lambda functions for core endpoints:
  - `/auth/login` - User authentication
  - `/auth/register` - User registration (with phone number)
  - `/user/profile` - Profile management
  - `/tracking/checkin` - Daily check-ins (encrypted)
  - `/tracking/photo` - Photo uploads
  - `/tracking/weight` - Weight logging (encrypted)
  - `/tracking/supplement` - Supplement tracking (encrypted)
- [ ] New endpoints [Enhancement]:
  - `/notifications/subscribe` - Push notification subscription
  - `/tracking/quick-complete` - Quick completion from notifications
  - `/notifications/handler` - Handle push notification delivery
  - `/notifications/scheduled-trigger` - EventBridge trigger endpoint

#### Database Schema (DynamoDB)
```
Users Table:
- userId (PK)
- email
- passwordHash
- createdAt
- preferences
- pushSubscription (JSON) [Enhancement]
- phone (String, optional) [Enhancement]
- notificationPreferences (JSON) [Enhancement]

Tracking Table:
- userId (PK)
- timestamp (SK)
- type (checkin|photo|weight|supplement)
- encryptedData (String) [Enhancement - was 'data']

Reminders Table:
- userId (PK)
- reminderId (SK)
- schedule
- type
- status
```

#### Authentication (Cognito)
- [x] User pool configuration
- [x] Password requirements (min 8 chars)
- [x] JWT token management
- [ ] Password reset flow

### Week 3-4: Core PWA Development

#### PWA Setup
- [x] React + TypeScript + Vite configuration
- [x] Service Worker for offline capability
- [x] Manifest.json for installability
- [x] HTTPS setup (required for PWA)

#### Core Components
```
/src
  /components
    - LoginScreen.tsx
    - DailyCheckin.tsx
    - PhotoCapture.tsx
    - VoiceInput.tsx
    - QuickLog.tsx
  /hooks
    - useAuth.ts
    - useVoice.ts
    - useCamera.ts
    - useNotifications.ts
  /services
    - api.ts
    - storage.ts
    - notifications.ts
    - encryption.ts [Enhancement]
    - pushNotifications.ts [Enhancement]
```

#### Essential Screens
1. **Login/Register**
   - Simple password protection
   - Remember me option
   - Biometric unlock (if available)

2. **Home Dashboard**
   - Today's summary
   - Quick action buttons
   - Streak counter

3. **Daily Check-in & Mood Journal**
   - Morning: "How's your energy?" (1-10 scale)
   - Morning: "How's your mood?" (1-10 + voice note)
   - Evening: "What brought you joy today?" (voice journal)
   - Evening: "What was challenging?" (voice reflection)
   - "What does happiness mean to you today?" (weekly prompt)
   - Quick photo capture

4. **Quick Log**
   - Weight input (number pad)
   - Supplement taken (yes/no)
   - Food photo + optional note

### Week 5-6: Voice Integration & Notifications

#### Voice Features
- [x] Web Speech API integration
- [x] Speech-to-text for all text inputs
- [ ] Voice commands:
  - "Log weight [number]"
  - "Took supplements"
  - "Feeling [1-10]"
- [x] Fallback to text input

#### Push Notifications [Enhancement]
- [ ] Web Push API with VAPID keys
- [ ] Service Worker notification handling with actions
- [ ] Permission request flow after login
- [ ] Quick action buttons on notifications:
  - "Complete" / "Snooze 10min"
- [ ] Basic notification schedule:
  ```
  Morning (7am): "Good morning! Ready for check-in?"
  Lunch (12pm): "Lunch break! Don't forget your photo"
  Evening (6pm): "Evening supplements?"
  Night (9pm): "How was your day?"
  ```
- [ ] SMS backup for critical alerts (AWS SNS)
- [ ] EventBridge scheduled triggers

#### Client-Side Encryption [Enhancement]
- [ ] crypto-js integration
- [ ] Password-derived key generation
- [ ] Encrypt all data before API calls
- [ ] Store only salt in localStorage
- [ ] Migration strategy for existing data

### Week 7-8: Testing & Polish

#### Mobile Optimization
- [ ] Touch-friendly UI (min 44px targets)
- [ ] Swipe gestures for common actions
- [ ] Landscape/portrait handling
- [ ] Performance optimization (<2s load)

#### Offline Functionality
- [ ] Cache critical assets
- [ ] Queue actions when offline
- [ ] Sync when connection returns
- [ ] Clear offline indicators

#### Core User Flows
1. **Morning Routine**
   - Notification → Tap → Energy scale → Mood scale → "How are you feeling?" voice note → Selfie → Done

2. **Meal Tracking**
   - Open app → Camera → Click → Add note (optional) → Save

3. **Voice Journal**
   - Hold microphone → Speak → Review text → Save

4. **Evening Reflection**
   - Notification → "What made you happy today?" → Voice response → "Any challenges?" → Voice response → Done

### Week 9-10: Beta Launch

#### Pre-Launch Checklist
- [ ] Security audit (OWASP Top 10)
- [ ] Performance testing (Lighthouse)
- [ ] Cross-device testing
- [ ] Notification delivery verification
- [ ] Data backup strategy

#### Beta Features
- [ ] 10 beta users recruitment
- [ ] Feedback collection mechanism
- [ ] Basic analytics (Mixpanel/GA)
- [ ] Error tracking (Sentry)
- [ ] Daily active use monitoring

### Technical Specifications

#### Frontend Stack
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "workbox": "^7.0.0",
  "react-router": "^6.0.0"
}
```

#### Backend Stack
- Node.js 18.x Lambda runtime
- API Gateway v2 (HTTP API)
- DynamoDB with on-demand pricing
- S3 for photo storage (lifecycle: 90 days)
- CloudWatch for monitoring

#### Third-Party Services
- Web Push API with VAPID [Enhancement - replacing FCM]
- AWS SNS for SMS backup [Enhancement]
- AWS SES for email (password reset)
- Cloudflare for CDN/HTTPS
- EventBridge for scheduled notifications [Enhancement]

### MVP Constraints

#### What's Included
✅ Password login
✅ Daily check-ins (energy, mood, photos)
✅ Mood journaling with voice
✅ Happiness exploration prompts
✅ Weight tracking
✅ Supplement reminders
✅ Basic voice input
✅ 4 daily notifications + journal prompts
✅ 7-day history with mood trends
✅ Offline support

#### What's NOT Included
❌ Social features
❌ Advanced analytics
❌ Food analysis
❌ Mood correlations
❌ Export functionality
❌ Multiple reminder schedules
❌ Smartwatch integration

### Success Metrics for Phase 1

- 90% notification delivery rate
- Voice input works 80% of time
- Zero critical security issues
- 70% daily active usage (beta users)
- <1% crash rate
- 100% of user data encrypted [Enhancement]
- Push notifications work on iOS/Android PWA [Enhancement]
- SMS fallback triggers for failed critical alerts [Enhancement]

### Risk Mitigation
1. **Voice Recognition Issues**
   - Always show text input option
   - Clear error messages
   - Retry button

2. **Photo Upload Failures**
   - Queue for retry
   - Compress before upload
   - Progress indicators

3. **Notification Fatigue**
   - Start with 2 notifications/day
   - Easy snooze/disable options
   - Respect quiet hours

4. **Encryption Key Loss** [Enhancement]
   - No password recovery possible
   - Clear user warning on signup
   - Export unencrypted backup option

5. **iOS PWA Limitations** [Enhancement]
   - User must add to home screen first
   - Clear installation instructions
   - SMS fallback for critical users

6. **Data Migration** [Enhancement]
   - Existing plaintext data warning
   - Grace period for export
   - One-time migration tool

### Rollout Plan
1. Internal testing (Week 8)
2. Friends & family (Week 9)
3. Beta users (Week 10)
4. Iterate based on feedback
5. Plan Phase 2 features

### Enhancement Implementation Timeline [New]
#### Week 11-12: Encryption Implementation
- [ ] Implement EncryptionService class with crypto-js
- [ ] Update all API calls to use encryption
- [ ] Migrate database schema (data → encryptedData)
- [ ] Add migration warnings for existing users
- [ ] Test encryption/decryption performance

#### Week 13-14: Push Notifications
- [ ] Generate VAPID keys for web push
- [ ] Update service worker with push handlers
- [ ] Add notification subscription endpoint
- [ ] Implement quick action responses
- [ ] Test on iOS 16.4+ and Android PWAs

#### Week 15: SMS Backup & Scheduling
- [ ] Configure AWS SNS for SMS
- [ ] Add phone number to registration flow
- [ ] Set up EventBridge scheduled rules
- [ ] Create scheduled notification Lambda
- [ ] Test SMS fallback scenarios

#### Week 16: Testing & Refinement
- [ ] End-to-end encryption testing
- [ ] Cross-device notification testing
- [ ] Performance impact assessment
- [ ] Security audit of encrypted data
- [ ] Beta user feedback on new features

### Phase 2 Preview
- RAG implementation for personalized insights
- Pattern detection across metrics
- Advanced reminder scheduling
- Data visualization
- Export capabilities
- Wearable integration