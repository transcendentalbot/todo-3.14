# Product Requirements Document - Reminder & Alert System
## Wellness Companion Notification Framework

### Overview
A context-aware notification system that adapts to user behavior and schedule, delivering timely wellness reminders through PWA push notifications.


### Notification Categories

#### 1. Time-Block Based Reminders
Notifications aligned with daily routine phases rather than fixed times.

**Sleep Zone (10pm - 6am)**
- Wind-down reminder (30 min before sleep)
- Morning wake greeting
- Sleep quality check-in

**Gym Hour (6am - 7am)**
- Pre-workout motivation
- Post-workout supplement reminder
- Energy level check

**Startup Deep Work (7am - 5pm)**
- Morning goal setting
- Lunch break reminder
- Afternoon energy check
- End-of-day reflection

**Office Hours (5pm - 8pm)**
- Transition notification
- Evening supplement reminder
- Dinner planning prompt

**Evening Routine (8pm - 10pm)**
- Dinner documentation
- Gratitude practice
- Next-day preparation

#### 2. Smart Reminder Features

**Adaptive Timing**
- Learns actual routine vs planned
- Adjusts notification times based on response patterns
- Detects schedule changes (weekends, travel)

**Progressive Intelligence**
- Week 1: Basic reminders ("Time for supplements")
- Week 4: Pattern-based ("You usually take supplements now")
- Month 2: Predictive ("Energy dip coming? Time for a walk")

**Context Awareness**
- Location-based adjustments
- Previous response consideration
- Cascading reminders for missed items

### Notification Types

#### 1. Standard Reminders
```
Title: "Morning Check-in 🌅"
Body: "How's your energy today?"
Actions: [Voice Reply] [Scale 1-10] [Snooze]
```

#### 2. Critical Alerts (Medications)
```
Title: "⚠️ Medication Reminder"
Body: "Time for your morning supplements"
Actions: [Taken] [Snooze 30min]
Repeat: Every 30 min until acknowledged
Fallback: SMS after 2 failed attempts
```

#### 3. Gentle Nudges
```
Title: "Wellness Companion"
Body: "Haven't heard from you today 💭"
Actions: [Quick Check-in] [Dismiss]
```

#### 4. Celebration Messages
```
Title: "🎉 7-Day Streak!"
Body: "You've tracked every day this week"
Actions: [View Progress] [Share]
```

### Interaction Models

#### Lock Screen Actions
- **Tap**: Opens quick action menu
- **Swipe Right**: Mark complete
- **Swipe Left**: Snooze options
- **Long Press**: Voice response

#### Voice Commands
- "Done" / "Taken" - Marks complete
- "Later" / "Snooze" - 30 min delay
- "Skip today" - Dismisses until tomorrow
- "More time" - 1 hour delay

#### In-App Response
- Opens to relevant screen
- Pre-filled with context
- One-tap confirmation

### Customization Options

#### User Preferences
- Notification volume per category
- Quiet hours setting
- Preferred reminder style (gentle/firm)
- Snooze duration options

#### Schedule Flexibility
- Weekday vs weekend schedules
- Vacation mode
- Custom time blocks
- Timezone auto-adjustment

### Technical Implementation

#### Push Notification Service [Updated]
- Web Push API with VAPID keys (replacing FCM)
- Service Worker push event handling
- Quick action buttons in notifications
- SMS fallback via AWS SNS for critical alerts
- Encrypted subscription data in DynamoDB

#### Backend Architecture [Updated]
```
Lambda Functions:
- notificationHandler: Process push requests
- scheduledNotificationTrigger: EventBridge handler
- /api/notifications/subscribe: Store push subscriptions
- /api/tracking/quick-complete: Handle notification actions
```

#### Scheduling System
- AWS EventBridge for reliable delivery
  - 7 AM: Morning check-in
  - 12 PM: Lunch reminder
  - 6 PM: Supplement reminder
  - 9 PM: Evening reflection
- DynamoDB for user preferences (encrypted)
- Lambda functions for logic
- CloudWatch for monitoring

#### Message Queue
- SQS for retry logic
- Priority queuing for critical alerts
- Batch processing for efficiency
- Dead letter queue for failures

#### Client-Side Encryption [New]
- All notification preferences encrypted before storage
- crypto-js for encryption/decryption
- Password-derived keys
- No plaintext user data in backend

### Analytics & Optimization

#### Key Metrics
- Open rate by notification type
- Response time distribution
- Snooze patterns
- Dismissal rate

#### A/B Testing
- Message copy variations
- Timing adjustments
- Action button options
- Emoji usage impact

#### Machine Learning
- Optimal send time prediction
- Message fatigue detection
- Engagement pattern analysis
- Personalization engine

### Privacy & Permissions

#### Required Permissions
- Push notifications
- Background app refresh
- Microphone (for voice)
- Camera (for photos)

#### User Control
- Granular notification settings
- Easy opt-out per category
- Data deletion rights
- Export functionality

### Edge Cases

#### Handling Scenarios
- Phone in Do Not Disturb
- Poor connectivity
- App uninstalled/reinstalled
- Multiple devices
- Time zone changes

### Success Criteria
- 90% delivery rate
- <2 second notification delay
- 70% interaction rate
- <5% unsubscribe rate

### Future Enhancements
- Watch/wearable integration
- Smart home device alerts
- Calendar integration
- Weather-based adjustments
- Social accountability features

### Implementation Status [New]

#### Phase 1 - Encryption (Week 11-12)
- [ ] Create EncryptionService class
- [ ] Update API calls for encrypted payloads
- [ ] Migrate user preferences to encrypted format
- [ ] Test encryption performance impact

#### Phase 2 - Push Notifications (Week 13-14)
- [ ] Generate VAPID public/private keys
- [ ] Update service worker with push handlers
- [ ] Create notification subscription endpoint
- [ ] Implement quick action handlers
- [ ] Request notification permissions post-login
- [ ] Test on iOS 16.4+ PWA

#### Phase 3 - SMS Backup (Week 15)
- [ ] Configure AWS SNS
- [ ] Add phone number to registration
- [ ] Create SMS fallback logic
- [ ] Set cost alerts ($0.01/SMS)

#### Phase 4 - Scheduled Notifications (Week 15)
- [ ] Create EventBridge rules (7am, 12pm, 6pm, 9pm)
- [ ] Deploy scheduled trigger Lambda
- [ ] Link to user preferences
- [ ] Test timezone handling

#### Testing Requirements
- [ ] iOS Safari PWA notifications
- [ ] Android Chrome PWA notifications
- [ ] Offline queue handling
- [ ] SMS delivery verification
- [ ] Encryption/decryption speed
- [ ] Battery impact assessment