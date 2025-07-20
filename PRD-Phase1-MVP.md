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
  - `/auth/register` - User registration
  - `/user/profile` - Profile management
  - `/tracking/checkin` - Daily check-ins
  - `/tracking/photo` - Photo uploads
  - `/tracking/weight` - Weight logging
  - `/tracking/supplement` - Supplement tracking

#### Database Schema (DynamoDB)
```
Users Table:
- userId (PK)
- email
- passwordHash
- createdAt
- preferences

Tracking Table:
- userId (PK)
- timestamp (SK)
- type (checkin|photo|weight|supplement)
- data (JSON)

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
- [ ] Web Speech API integration
- [ ] Speech-to-text for all text inputs
- [ ] Voice commands:
  - "Log weight [number]"
  - "Took supplements"
  - "Feeling [1-10]"
- [ ] Fallback to text input

#### Push Notifications
- [ ] FCM setup for cross-platform
- [ ] Service Worker notification handling
- [ ] Permission request flow
- [ ] Basic notification schedule:
  ```
  Morning (7am): "Good morning! Ready for check-in?"
  Lunch (12pm): "Lunch break! Don't forget your photo"
  Evening (6pm): "Evening supplements?"
  Night (9pm): "How was your day?"
  ```

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
- FCM for push notifications
- AWS SES for email (password reset)
- Cloudflare for CDN/HTTPS

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
- App loads in <2 seconds
- 90% notification delivery rate
- Voice input works 80% of time
- Zero critical security issues
- 70% daily active usage (beta users)
- <1% crash rate

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

### Rollout Plan
1. Internal testing (Week 8)
2. Friends & family (Week 9)
3. Beta users (Week 10)
4. Iterate based on feedback
5. Plan Phase 2 features

### Phase 2 Preview
- RAG implementation for personalized insights
- Pattern detection across metrics
- Advanced reminder scheduling
- Data visualization
- Export capabilities
- Wearable integration