# Journal Intelligence System - Phase 2 PRD

## Executive Summary
Build a serverless journal analysis system that understands user needs through natural language processing, storing encrypted entries while extracting actionable insights to create personalized notifications and support.

## Core Objective
Transform daily journal entries into an intelligent understanding of user needs, emotions, and patterns - creating a system that feels like it truly knows and supports the user.

## System Architecture

### Data Flow
1. User speaks/types journal entry
2. Voice tone + text analyzed for emotion and intent
3. Entry encrypted and stored
4. AI extracts needs, tasks, and emotional state
5. System adapts notifications and prompts accordingly
6. Context builds over time for deeper understanding

### AWS Services Required
- **Lambda**: Processing and API endpoints
- **DynamoDB**: User data and recent entries
- **OpenSearch Serverless**: Vector embeddings for semantic search
- **Bedrock**: LLM analysis and embeddings
- **S3**: Archived entries and summaries
- **EventBridge**: Scheduled processing
- **Step Functions**: Complex workflows

## Key Features

### 1. Intelligent Journal Processing
**Input**: "I have a big tummy, feeling really down about it"

**System Extracts**:
- Emotion: Low self-esteem, body image concern
- Implicit need: Fitness support, encouragement
- Action: Schedule gentle workout reminders
- Tone for response: Supportive, non-judgmental

### 2. Context-Aware Notifications
**Evolution Example**:
- Week 1: "Time for your workout!"
- Week 4: "Hey, remember how good you felt after Tuesday's workout?"
- Week 8: "Tough day? Even a 10-minute walk counts. You've got this!"

### 3. Implicit Task Detection
**Input**: "Haven't talked to mom in weeks, really miss her"

**System Creates**:
- Reminder: "Sunday morning might be a good time to call mom"
- Context: Adds family connection to user profile
- Pattern: Tracks family communication frequency

### 4. Adaptive Scheduling
**Input**: "Exhausted, going to bed early tonight, need to wake up at 5am for that presentation"

**System Adjusts**:
- Tomorrow's morning notification: 4:45am
- Evening notification: Earlier to encourage rest
- Adds presentation to context for follow-up

## Database Schema

### journal_entries table
- **PK**: USER#{userId}
- **SK**: ENTRY#{timestamp}
- **encryptedContent**: Full journal entry
- **extractedInsights**: Encrypted AI analysis
- **embedding**: Vector for similarity search
- **metadata**: { emotion, hasTask, topics }
- **TTL**: 30 days (then archive to S3)

### user_context table
- **PK**: USER#{userId}
- **SK**: CONTEXT#current
- **recentPatterns**: Last 7 days summary
- **emotionalProfile**: Mood patterns
- **activeGoals**: Current focus areas
- **notificationPreferences**: Learned timing

### insight_queue table
- **PK**: USER#{userId}
- **SK**: TASK#{timestamp}
- **taskType**: reminder|goal|check-in
- **context**: Why this was created
- **scheduledFor**: When to notify

## AI Processing Pipeline

### Real-time Analysis (On Journal Save)
1. Decrypt entry in Lambda memory
2. Send to Bedrock Claude for analysis
3. Extract: emotions, needs, tasks, insights
4. Generate embedding for semantic search
5. Store encrypted insights
6. Queue any notifications/reminders

### Nightly Processing (EventBridge)
1. Summarize day's entries
2. Update user emotional patterns
3. Adjust notification schedule
4. Archive old entries to S3

### Weekly Intelligence (Step Functions)
1. Generate weekly insights
2. Identify recurring patterns
3. Update long-term user profile
4. Suggest new prompts/questions

## Privacy & Security

### Encryption Flow
1. Client encrypts journal before sending
2. Server processes in Lambda memory only
3. AI insights encrypted before storage
4. Original entries never logged
5. User owns their encryption key

### AI Privacy
- Use Bedrock with no-logging agreement
- No PII in prompts to AI
- Process in batches to anonymize
- Delete Lambda logs after 24 hours

## Implementation Phases

### Week 1-2: Foundation
- Set up DynamoDB tables
- Basic Lambda functions for CRUD
- Encryption/decryption flow
- Simple Bedrock integration

### Week 3-4: Intelligence Layer
- OpenSearch Serverless setup
- Embedding generation
- Semantic search implementation
- Context retrieval system

### Week 5-6: Adaptive System
- Pattern recognition
- Notification intelligence
- Scheduled processing
- User profile building

### Week 7-8: Polish & Scale
- Performance optimization
- Error handling
- Monitoring setup
- Beta testing

## Success Metrics

### Technical
- Journal processing < 2 seconds
- Relevant context retrieval < 1 second
- 99.9% uptime
- Zero data breaches

### User Experience
- 80% of extracted tasks are accurate
- Notification engagement > 70%
- Users report feeling "understood"
- Reduced notification fatigue

## Cost Projections

### Per User Monthly
- DynamoDB: $0.25
- Lambda: $0.15
- Bedrock Claude: $2.00
- OpenSearch: $0.50
- S3: $0.10
- **Total**: ~$3.00/user

### At Scale (10K users)
- Monthly: $30,000
- With optimizations: $20,000
- Break-even: ~$5/user subscription

## Future Integration Points

### Phase 2 Additions
- Apple Watch: Heart rate during journal
- Sleep Cycle: Sleep quality correlation
- Health Kit: Physical activity patterns
- Calendar: Schedule intelligence

### Data Correlation
When user says "exhausted", Phase 2 can correlate:
- Last night's sleep: 5 hours (from Sleep Cycle)
- Today's steps: 2,000 (from Apple Watch)
- Heart rate variability: Low (from sensors)
- Suggestion: "Early bed tonight? Your body needs rest"

## Critical Implementation Notes

### For Claude Code Opus
1. Start with the Lambda functions - They're the core of everything
2. Use Bedrock's Claude model - It understands nuance better than Titan
3. Don't over-engineer the embeddings - 1536 dimensions is plenty
4. Cache user context aggressively - Most queries need last 7 days
5. Use Step Functions for complex flows - Don't put everything in one Lambda

### Architecture Decisions
- **Why OpenSearch Serverless**: Auto-scaling, no maintenance
- **Why Bedrock**: AWS-native, private, no data retention
- **Why DynamoDB**: Serverless, fast, automatic expiration
- **Why Step Functions**: Visual workflows, easy debugging

### What NOT to Build Yet
- Complex RAG system (semantic search is enough)
- Real-time streaming (batch processing is fine)
- Multi-model ensemble (one LLM is sufficient)
- Custom ML models (use Bedrock's pre-trained)

## The Core Insight
Users don't just want their tasks tracked - they want to feel heard and supported. Every journal entry is a conversation with themselves, and our system makes that conversation productive by understanding the subtext and responding with intelligent, timely support.

The magic is making complex AI feel simple and helpful, not creepy or invasive.