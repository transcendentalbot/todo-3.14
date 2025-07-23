# Phase 2: Journal Intelligence - Project Requirements Plan (PRP)

## Executive Summary
This PRP provides a comprehensive implementation plan for the Journal Intelligence System, breaking down the PRD requirements into actionable tasks with clear acceptance criteria, technical specifications, and tracking mechanisms.

## Project Overview
- **Duration**: 8 weeks (56 days)
- **Start Date**: Current
- **Team Size**: 1 developer
- **Budget**: ~$500 for AWS services during development

## Sprint Structure
- **Sprint Duration**: 1 week
- **Daily Commitment**: 2-3 hours
- **Review Cadence**: End of each sprint

---

# Sprint 1: Foundation (Week 1)
**Goal**: Set up database infrastructure and basic journal CRUD operations

## Task 1.1: DynamoDB Tables Setup
**Priority**: P0 (Blocker)
**Effort**: 2 hours
**Dependencies**: None

### Technical Details:
```yaml
journal_entries:
  PK: USER#{userId}
  SK: ENTRY#{timestamp}
  Attributes:
    - encryptedContent (String)
    - extractedInsights (String, encrypted)
    - embedding (List<Number>)
    - metadata (Map)
    - createdAt (String)
    - TTL (Number, 30 days)

user_context:
  PK: USER#{userId}
  SK: CONTEXT#current
  Attributes:
    - recentPatterns (Map)
    - emotionalProfile (Map)
    - activeGoals (List)
    - notificationPreferences (Map)
    - lastUpdated (String)

insight_queue:
  PK: USER#{userId}
  SK: TASK#{timestamp}
  Attributes:
    - taskType (String)
    - context (String)
    - scheduledFor (String)
    - status (String)
    - createdAt (String)
```

### Implementation Steps:
- [ ] Update `backend/serverless.yml` with new table definitions
- [ ] Add GSI for insight_queue (GSI1: scheduledFor)
- [ ] Set up TTL on journal_entries
- [ ] Configure on-demand billing

### Acceptance Criteria:
- [ ] Tables created in AWS console
- [ ] Can write/read test data
- [ ] TTL configured and tested
- [ ] GSI queryable

---

## Task 1.2: Journal Lambda Functions
**Priority**: P0
**Effort**: 4 hours
**Dependencies**: Task 1.1

### Technical Details:
Create new Lambda functions in `backend/functions/journal/`:
```typescript
// handler.ts - Main journal operations
export const createEntry = async (event) => {}
export const getEntries = async (event) => {}
export const getEntry = async (event) => {}
export const updateEntry = async (event) => {}
export const deleteEntry = async (event) => {}

// search.ts - Search functionality
export const searchEntries = async (event) => {}
```

### Implementation Steps:
- [ ] Create `backend/functions/journal/` directory
- [ ] Implement CRUD operations with encryption
- [ ] Add input validation using existing utils
- [ ] Integrate with auth middleware
- [ ] Add error handling and logging

### Acceptance Criteria:
- [ ] All CRUD operations working
- [ ] Encryption/decryption functional
- [ ] Auth required for all endpoints
- [ ] Proper error responses

---

## Task 1.3: API Gateway Endpoints
**Priority**: P0
**Effort**: 1 hour
**Dependencies**: Task 1.2

### Technical Details:
```yaml
functions:
  journalCreate:
    handler: functions/journal/handler.createEntry
    events:
      - http:
          path: /journal/entry
          method: POST
          cors: true
          authorizer: customAuthorizer
  
  journalList:
    handler: functions/journal/handler.getEntries
    events:
      - http:
          path: /journal/entries
          method: GET
          cors: true
          authorizer: customAuthorizer
```

### Implementation Steps:
- [ ] Add journal endpoints to serverless.yml
- [ ] Configure CORS settings
- [ ] Set up authorizer
- [ ] Deploy and test endpoints

### Acceptance Criteria:
- [ ] Endpoints accessible via Postman
- [ ] Auth working correctly
- [ ] CORS not blocking frontend

---

## Task 1.4: Frontend Journal Component
**Priority**: P0
**Effort**: 4 hours
**Dependencies**: None (can parallel with backend)

### Technical Details:
Create `frontend/src/screens/Journal.tsx`:
```typescript
interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
  metadata?: {
    emotion?: string;
    mood?: number;
  };
}
```

### Implementation Steps:
- [ ] Create Journal screen component
- [ ] Add route to App.tsx
- [ ] Implement journal entry form
- [ ] Add voice input integration
- [ ] Create journal list view
- [ ] Add navigation from Dashboard

### Acceptance Criteria:
- [ ] Can navigate to journal screen
- [ ] Voice input working
- [ ] Can save journal entries
- [ ] List shows past entries
- [ ] Encryption working client-side

---

## Task 1.5: Journal Service Integration
**Priority**: P0
**Effort**: 2 hours
**Dependencies**: Task 1.3, 1.4

### Technical Details:
Create `frontend/src/services/journal.ts`:
```typescript
export class JournalService {
  static async createEntry(content: string): Promise<JournalEntry>
  static async getEntries(): Promise<JournalEntry[]>
  static async searchEntries(query: string): Promise<JournalEntry[]>
}
```

### Implementation Steps:
- [ ] Create journal service class
- [ ] Integrate with encryption service
- [ ] Add API error handling
- [ ] Implement offline queue
- [ ] Add loading states

### Acceptance Criteria:
- [ ] Full CRUD working end-to-end
- [ ] Offline entries queue properly
- [ ] Errors shown to user
- [ ] Loading states visible

---

# Sprint 2: AI Integration (Week 2)
**Goal**: Integrate AWS Bedrock for emotion and task extraction

## Task 2.1: AWS Bedrock Setup
**Priority**: P0
**Effort**: 2 hours
**Dependencies**: AWS Account access

### Technical Details:
```typescript
// backend/services/bedrock.ts
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const modelId = "anthropic.claude-3-haiku-20240307-v1:0";
```

### Implementation Steps:
- [ ] Enable Bedrock in AWS Console
- [ ] Request access to Claude Haiku model
- [ ] Add IAM permissions to Lambda role
- [ ] Install AWS SDK for Bedrock
- [ ] Create bedrock service wrapper

### Acceptance Criteria:
- [ ] Can invoke Bedrock from Lambda
- [ ] Costs tracked in AWS
- [ ] Rate limiting implemented
- [ ] Error handling for quota limits

---

## Task 2.2: Emotion Extraction Lambda
**Priority**: P0
**Effort**: 4 hours
**Dependencies**: Task 2.1

### Technical Details:
Create `backend/functions/journal/ai-processor.ts`:
```typescript
const EMOTION_PROMPT = `
Analyze this journal entry and extract:
1. Primary emotion (happy, sad, anxious, etc.)
2. Emotion intensity (1-10)
3. Any implicit needs or concerns
4. Suggested support type

Journal: {entry}

Respond in JSON format.
`;
```

### Implementation Steps:
- [ ] Create AI processor Lambda
- [ ] Design emotion extraction prompt
- [ ] Parse Bedrock responses
- [ ] Store insights encrypted
- [ ] Handle AI failures gracefully

### Acceptance Criteria:
- [ ] Emotions extracted accurately
- [ ] JSON parsing reliable
- [ ] Insights stored in DB
- [ ] Costs within budget (<$0.01/entry)

---

## Task 2.3: Task Detection System
**Priority**: P1
**Effort**: 3 hours
**Dependencies**: Task 2.2

### Technical Details:
```typescript
const TASK_PROMPT = `
Extract any implicit or explicit tasks from this journal entry.
Include context about why this might be important to the user.

Examples:
- "Haven't called mom" → Task: "Call mom", Context: "Family connection"
- "Need to exercise more" → Task: "Schedule workout", Context: "Health goal"

Journal: {entry}
`;
```

### Implementation Steps:
- [ ] Create task extraction prompt
- [ ] Implement task queue integration
- [ ] Add task scheduling logic
- [ ] Connect to notification system
- [ ] Test extraction accuracy

### Acceptance Criteria:
- [ ] Tasks extracted with 80% accuracy
- [ ] Tasks added to insight_queue
- [ ] Notifications scheduled correctly
- [ ] Context preserved for tasks

---

## Task 2.4: Frontend AI Integration
**Priority**: P1
**Effort**: 2 hours
**Dependencies**: Task 2.2, 2.3

### Technical Details:
Update Journal component to show AI insights:
```typescript
interface JournalInsights {
  emotion?: string;
  emotionIntensity?: number;
  detectedTasks?: Task[];
  suggestedSupport?: string;
}
```

### Implementation Steps:
- [ ] Add insights display to journal entries
- [ ] Create emotion visualization
- [ ] Show detected tasks
- [ ] Add insight feedback mechanism
- [ ] Update UI for loading states

### Acceptance Criteria:
- [ ] Insights visible after processing
- [ ] Loading state during AI processing
- [ ] Can provide feedback on accuracy
- [ ] Tasks shown clearly

---

# Sprint 3: Embeddings & Search (Week 3)
**Goal**: Implement semantic search using embeddings

## Task 3.1: Embedding Generation
**Priority**: P1
**Effort**: 3 hours
**Dependencies**: Task 2.1

### Technical Details:
```typescript
// Use Bedrock Titan Embeddings
const EMBEDDING_MODEL = "amazon.titan-embed-text-v1";
const EMBEDDING_DIMENSIONS = 1536;
```

### Implementation Steps:
- [ ] Integrate Titan embeddings model
- [ ] Generate embeddings for new entries
- [ ] Batch process existing entries
- [ ] Store in DynamoDB efficiently
- [ ] Add embedding cache

### Acceptance Criteria:
- [ ] Embeddings generated < 1 second
- [ ] Storage optimized (compressed)
- [ ] Batch processing working
- [ ] Cache hit rate > 80%

---

## Task 3.2: Semantic Search
**Priority**: P1
**Effort**: 4 hours
**Dependencies**: Task 3.1

### Technical Details:
```typescript
// Implement cosine similarity search
function cosineSimilarity(a: number[], b: number[]): number {
  // Implementation
}

// Find similar entries
async function findSimilarEntries(
  embedding: number[], 
  threshold: number = 0.7
): Promise<JournalEntry[]>
```

### Implementation Steps:
- [ ] Implement similarity algorithm
- [ ] Create search Lambda function
- [ ] Add search API endpoint
- [ ] Optimize for performance
- [ ] Add search result ranking

### Acceptance Criteria:
- [ ] Search returns relevant results
- [ ] Performance < 500ms
- [ ] Similarity threshold tunable
- [ ] Results ranked by relevance

---

## Task 3.3: Context Retrieval System
**Priority**: P1
**Effort**: 3 hours
**Dependencies**: Task 3.2

### Technical Details:
Build system to retrieve relevant context for notifications:
```typescript
interface UserContext {
  recentMood: MoodPattern;
  activeTopics: string[];
  behaviorPatterns: Pattern[];
  lastSimilarEntry?: JournalEntry;
}
```

### Implementation Steps:
- [ ] Design context aggregation logic
- [ ] Implement pattern detection
- [ ] Create context caching
- [ ] Add time-decay for relevance
- [ ] Build context API

### Acceptance Criteria:
- [ ] Context includes last 7 days
- [ ] Patterns detected accurately
- [ ] Cache reduces DB calls 70%
- [ ] Context updates real-time

---

# Sprint 4: Pattern Recognition (Week 4)
**Goal**: Detect patterns and create intelligent notifications

## Task 4.1: Pattern Detection Engine
**Priority**: P1
**Effort**: 4 hours
**Dependencies**: Sprint 3 completion

### Technical Details:
```typescript
interface Pattern {
  type: 'mood' | 'behavior' | 'topic';
  frequency: number;
  timePattern?: string; // "morning", "weekend", etc.
  trigger?: string;
  confidence: number;
}
```

### Implementation Steps:
- [ ] Create pattern detection algorithms
- [ ] Implement time-based analysis
- [ ] Add mood pattern tracking
- [ ] Build topic clustering
- [ ] Create pattern storage

### Acceptance Criteria:
- [ ] Detects recurring patterns
- [ ] Confidence scores accurate
- [ ] Patterns update daily
- [ ] Can explain patterns to user

---

## Task 4.2: Intelligent Notification Generator
**Priority**: P1
**Effort**: 4 hours
**Dependencies**: Task 4.1

### Technical Details:
```typescript
// Generate context-aware notifications
async function generateNotification(
  user: User,
  context: UserContext,
  type: NotificationType
): Promise<Notification> {
  // Use patterns and context to create personalized message
}
```

### Implementation Steps:
- [ ] Create notification templates
- [ ] Implement personalization logic
- [ ] Add A/B testing framework
- [ ] Build notification scheduler
- [ ] Connect to existing push system

### Acceptance Criteria:
- [ ] Notifications feel personalized
- [ ] Timing adapts to user patterns
- [ ] A/B tests trackable
- [ ] Click rates improve 20%

---

# Sprint 5-6: Adaptive System (Weeks 5-6)
**Goal**: Build learning system that adapts to user feedback

## Task 5.1: Feedback Loop Implementation
**Priority**: P2
**Effort**: 3 hours
**Dependencies**: Sprint 4 completion

### Technical Details:
Track user engagement with notifications and insights:
```typescript
interface FeedbackEvent {
  type: 'notification_clicked' | 'task_completed' | 'insight_helpful';
  entityId: string;
  timestamp: string;
  metadata?: any;
}
```

### Implementation Steps:
- [ ] Create feedback tracking table
- [ ] Implement feedback API
- [ ] Add frontend feedback UI
- [ ] Build feedback analytics
- [ ] Create learning algorithms

### Acceptance Criteria:
- [ ] All interactions tracked
- [ ] Feedback influences future behavior
- [ ] Analytics dashboard available
- [ ] Privacy preserved

---

## Task 5.2: User Profile Evolution
**Priority**: P2
**Effort**: 4 hours
**Dependencies**: Task 5.1

### Technical Details:
Build evolving user profiles based on behavior:
```typescript
interface EvolvingProfile {
  preferences: {
    notificationTiming: TimePreference[];
    communicationStyle: 'encouraging' | 'direct' | 'gentle';
    reminderFrequency: 'high' | 'medium' | 'low';
  };
  learningHistory: LearningEvent[];
}
```

### Implementation Steps:
- [ ] Design profile evolution logic
- [ ] Implement preference learning
- [ ] Add style adaptation
- [ ] Create profile versioning
- [ ] Build rollback mechanism

### Acceptance Criteria:
- [ ] Profiles evolve weekly
- [ ] Changes are explainable
- [ ] Can revert bad changes
- [ ] User can override

---

# Sprint 7-8: Polish & Launch (Weeks 7-8)
**Goal**: Optimize, test, and launch to beta users

## Task 7.1: Performance Optimization
**Priority**: P1
**Effort**: 4 hours
**Dependencies**: All previous sprints

### Optimization Targets:
- Journal save: < 1 second
- AI processing: < 2 seconds
- Search results: < 500ms
- Notification generation: < 100ms

### Implementation Steps:
- [ ] Profile Lambda cold starts
- [ ] Optimize DB queries
- [ ] Implement caching strategy
- [ ] Reduce Bedrock token usage
- [ ] Add CloudFront caching

### Acceptance Criteria:
- [ ] All targets met
- [ ] Costs within budget
- [ ] No degraded UX
- [ ] Monitoring in place

---

## Task 7.2: Security Audit
**Priority**: P0
**Effort**: 3 hours
**Dependencies**: None

### Security Checklist:
- [ ] All journal data encrypted at rest
- [ ] AI prompts sanitized
- [ ] No PII in logs
- [ ] Rate limiting on all endpoints
- [ ] Bedrock access scoped properly
- [ ] Encryption keys rotated

### Acceptance Criteria:
- [ ] Passes security scan
- [ ] No sensitive data exposed
- [ ] Audit trail complete
- [ ] Compliance documented

---

## Task 8.1: Beta Launch Preparation
**Priority**: P0
**Effort**: 4 hours
**Dependencies**: Sprint 7 completion

### Launch Checklist:
- [ ] Feature flags configured
- [ ] Beta user list prepared
- [ ] Monitoring dashboards ready
- [ ] Support documentation written
- [ ] Rollback plan tested
- [ ] Cost alerts configured

### Acceptance Criteria:
- [ ] Can enable per-user
- [ ] Metrics tracking working
- [ ] Documentation complete
- [ ] Team trained on support

---

## Task 8.2: Beta User Onboarding
**Priority**: P0
**Effort**: 2 hours
**Dependencies**: Task 8.1

### Onboarding Flow:
1. Enable feature flag for user
2. Show onboarding tour
3. Explain AI features
4. Set privacy expectations
5. Collect initial feedback

### Acceptance Criteria:
- [ ] 10 beta users onboarded
- [ ] 80% complete onboarding
- [ ] Feedback collected
- [ ] No major issues

---

# Success Metrics

## Technical Metrics
- [ ] Journal processing < 2 seconds (95th percentile)
- [ ] AI accuracy > 80% (user validated)
- [ ] Search relevance > 70% (click-through rate)
- [ ] System uptime > 99.9%
- [ ] Monthly cost < $3 per active user

## User Metrics
- [ ] Daily journal entries: 1.5 average
- [ ] Task completion rate > 60%
- [ ] Notification engagement > 70%
- [ ] User satisfaction > 4/5 stars
- [ ] 30-day retention > 80%

## Business Metrics
- [ ] Beta NPS score > 50
- [ ] Feature adoption > 90% of beta users
- [ ] Support tickets < 1 per user/month
- [ ] Ready for GA launch by week 8

---

# Risk Management

## High-Risk Items
1. **Bedrock Costs**: Implement strict token limits
2. **AI Accuracy**: Start with simple prompts, iterate
3. **Privacy Concerns**: Clear consent, strong encryption
4. **Performance**: Cache aggressively, optimize early

## Mitigation Strategies
- Daily cost monitoring
- User feedback loops
- Progressive feature rollout
- Comprehensive logging

---

# Daily Tracking Template

## Sprint X, Day Y
**Date**: YYYY-MM-DD
**Tasks Planned**: 
- [ ] Task ID: Description

**Completed**:
- Task ID ✓

**Blockers**:
- None

**Notes**:
- 

**Tomorrow**:
- Task ID: Description

---

# Commands Reference

## Development
```bash
# Backend
cd backend
npm run dev        # Local development
npm test          # Run tests
npm run deploy    # Deploy to AWS

# Frontend
cd frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm test          # Run tests

# Journal-specific tests
npm run test:journal
npm run test:ai
```

## Monitoring
```bash
# Check Bedrock usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/Bedrock \
  --metric-name InvokeModelTokenCount \
  --dimensions Name=ModelId,Value=anthropic.claude-3-haiku \
  --statistics Sum \
  --start-time 2024-01-20T00:00:00Z \
  --end-time 2024-01-21T00:00:00Z \
  --period 3600

# Check costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics "UnblendedCost" \
  --filter file://cost-filter.json
```

---

This PRP provides a complete roadmap for Phase 2 implementation. Each task has clear technical details, acceptance criteria, and dependencies. Use the daily tracking template to monitor progress and the success metrics to validate the implementation.