# Wellness Companion Project Context

## Project Overview
Building a comprehensive wellness tracking PWA that serves as a personal health companion, combining features of a spiritual guide, personal assistant, nutritionist, and motivator. The app is voice-first, mobile-optimized, and uses intelligent reminders to help users track their daily wellness journey.

## Key Documents to Read
1. **PRD-Wellness-Companion.md** - Main product requirements document
2. **PRD-Reminders-Alerts.md** - Detailed notification system design  
3. **PRD-Phase1-MVP.md** - 10-week implementation plan for MVP

## Project Status
- Currently in planning/specification phase
- Ready to begin Phase 1 implementation
- Focus on MVP features first

## Technical Stack (Planned)
### Frontend
- React + TypeScript
- Vite build tool
- PWA with Service Workers
- Web Speech API for voice input
- Push notifications via FCM

### Backend  
- AWS Lambda + API Gateway
- DynamoDB for data storage
- S3 for photo storage
- Cognito for authentication
- EventBridge for scheduled reminders

## Core Features
1. **Voice-First Input** - All interactions can be done via voice
2. **Daily Tracking** - Photos (selfie/food), weight, supplements, energy levels
3. **Mood Journaling** - Daily mood tracking, happiness exploration, guided reflection
4. **Smart Reminders** - Context-aware notifications that adapt to user behavior
5. **Time-Block Schedule** - Organized around sleep, gym, startup work, office hours
6. **Mobile PWA** - Installable web app with offline support

## Journaling & Mood Focus
- Daily mood ratings (1-10) with voice notes
- "What brought joy today?" evening reflections
- "What was challenging?" processing prompts
- Weekly "What is happiness for me?" deep dives
- Pattern analysis to identify happiness triggers
- Guidance for navigating difficult emotions

## User Profile
- Entrepreneur with hybrid schedule
- 10 hours startup work, 3 hours office
- Values efficiency and voice interaction
- Needs reminders even when phone is locked
- Seeking to understand personal happiness patterns
- Wants to learn what brings fulfillment
- Interested in mood-activity correlations

## Current Phase: MVP (Phase 1)
### Week 1-2: Backend Infrastructure
### Week 3-4: Core PWA Development  
### Week 5-6: Voice Integration & Notifications
### Week 7-8: Testing & Polish
### Week 9-10: Beta Launch

## Important Constraints
- Must work offline for basic features
- All interactions < 3 taps/commands
- Notifications must work on locked phones
- Page load < 2 seconds on 3G
- Voice-first but with text fallbacks

## Development Guidelines
- Mobile-first responsive design
- Password protected (no complex auth in MVP)
- Focus on core tracking features first
- Defer advanced AI/ML features to Phase 2

## Next Steps
1. Set up AWS infrastructure
2. Initialize React PWA project
3. Implement basic authentication
4. Build core tracking components
5. Add voice input capabilities
6. Configure push notifications

## Commands to Run
- TBD: Will be updated as project progresses
- Lint command: TBD
- Test command: TBD
- Build command: TBD

## Available Commands
- `/update` - Update PRD task lists as tasks are completed
  - Usage: `./update -l phase1` (list tasks)
  - Usage: `./update -c "Task description"` (mark complete)
  - Usage: `./update -u "Task description"` (mark incomplete)
  - Interactive mode: `./update`