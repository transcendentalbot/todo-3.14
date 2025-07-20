# Product Requirements Document (PRD)
## Wellness Companion - Personal Health & Mindset Tracker

### Executive Summary
A PWA-based wellness companion that serves as a spiritual guide, personal assistant, nutritionist, and motivator. The app uses voice input, photo capture, and intelligent reminders to track daily wellness metrics and provide personalized feedback through an adaptive AI system.

### Problem Statement
Entrepreneurs and busy professionals struggle to maintain consistent wellness habits due to:
- Fragmented tracking across multiple apps
- Lack of personalized, context-aware reminders
- Difficulty capturing wellness data while mobile
- No holistic view connecting physical, mental, and spiritual health

### Target User
- Primary: Entrepreneurs with hybrid work schedules
- Secondary: Health-conscious professionals
- Key trait: Values efficiency and voice-first interactions

### Core Features

#### 1. Voice-First Journaling & Mood Exploration
- Speech-to-text for reflective journaling
- Daily mood tracking with happiness exploration
- Guided prompts for self-discovery
- Natural language command processing
- Hands-free operation while mobile
- Emotional tone and pattern analysis
- "What made me happy today?" prompts
- "What drained my energy?" reflections

#### 2. Multi-Modal Tracking
- **Daily Photos**: Selfies for appearance tracking
- **Weight Logging**: Manual or voice input
- **Food Photos**: Meal documentation with portion estimation
- **Supplement Tracking**: Photo verification + reminders

#### 3. Intelligent Reminder System
- Time-block based notifications (not rigid schedules)
- Context-aware adjustments
- Lock screen interactions
- Voice response capabilities

#### 4. Adaptive Feedback Loop & Happiness Learning
- Dynamic question generation for mood patterns
- "What is happiness for me?" exploration
- Pattern recognition across mood, activities, and wellness
- Personalized insights about happiness triggers
- Navigation suggestions for difficult emotions
- RAG implementation for growing emotional intelligence
- Weekly happiness pattern summaries

#### 5. Security & Privacy
- Password protected access
- End-to-end encryption for sensitive data
- Local processing where possible
- User-owned data export

### Technical Architecture

#### Frontend (PWA)
- React with TypeScript
- Web Speech API for voice input
- Service Workers for offline + push notifications
- Camera API for photo capture
- Mobile-first responsive design

#### Backend (AWS)
- API Gateway + Lambda functions
- DynamoDB for user data
- S3 for photo storage
- Cognito for authentication
- EventBridge for scheduled reminders

#### AI/ML Services
- Transcription service for voice-to-text
- Image analysis for food portions
- NLP for command processing
- Pattern recognition for insights

### MVP Scope (Phase 1)

#### Core Functionality
1. User authentication (password)
2. Basic daily tracking:
   - Morning/evening check-ins with mood
   - Photo capture (selfie, food)
   - Weight logging
   - Supplement reminders
3. Journaling features:
   - Daily mood rating (1-10)
   - "What brought joy today?" prompt
   - "What was challenging?" reflection
   - Voice journaling sessions
4. Voice input for all entries
5. Push notifications for reminders
6. Daily summary with mood trends

#### Deferred to Phase 2
- RAG implementation
- Advanced pattern analysis
- Mood/energy correlations
- Social features
- Data export

### Success Metrics
- Daily active usage rate > 80%
- Average session length > 2 minutes
- Reminder response rate > 70%
- User retention at 30 days > 60%

### Constraints
- Must work offline for basic features
- All interactions < 3 taps/commands
- Notifications must work on locked phones
- Page load < 2 seconds on 3G

### Timeline
- Week 1-2: Backend infrastructure + auth
- Week 3-4: Core PWA with basic tracking
- Week 5-6: Voice integration + notifications
- Week 7-8: Testing + refinement
- Week 9-10: Beta launch

### Risks & Mitigations
- **Risk**: Low notification engagement
  - **Mitigation**: A/B test timing and messaging
- **Risk**: Voice recognition accuracy
  - **Mitigation**: Fallback to text input
- **Risk**: Photo storage costs
  - **Mitigation**: Compression + lifecycle policies