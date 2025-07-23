# Journal Intelligence Testing Guide

## 🧪 Testing Checklist

### 1. Basic Journal Functionality
- [ ] Navigate to https://todo-3-14.vercel.app/
- [ ] Login with test credentials
- [ ] Click "Voice Journal" on dashboard
- [ ] Create a text journal entry
- [ ] Verify entry saves and appears in list
- [ ] Try voice input (click microphone)
- [ ] Edit an existing entry
- [ ] Delete an entry

### 2. AI Emotion Analysis
Test with these journal entries:

#### Happy Entry:
```
"Had an amazing day! Got promoted at work and celebrated with friends. Feeling on top of the world!"
```
Expected: 
- Emotion: happy/excited
- Intensity: 8-10
- Sentiment: positive

#### Anxious Entry:
```
"Can't stop thinking about tomorrow's presentation. What if I mess up? My heart is racing just thinking about it."
```
Expected:
- Emotion: anxious/worried
- Intensity: 7-9
- Sentiment: negative

#### Mixed Entry:
```
"Finally finished the project but exhausted. Proud of what I accomplished but need a break."
```
Expected:
- Emotion: tired/proud
- Sentiment: mixed

### 3. Task Detection
Test entries that should extract tasks:

#### Direct Task:
```
"I need to call mom tomorrow and schedule dentist appointment for next week"
```
Expected tasks:
- Call mom (high priority)
- Schedule dentist appointment (medium priority)

#### Implicit Task:
```
"Haven't been to the gym in weeks, really need to get back into my routine"
```
Expected task:
- Go to gym / restart workout routine

#### Relationship Task:
```
"It's been too long since I talked to Sarah. Miss our conversations."
```
Expected task:
- Reach out to Sarah

### 4. Semantic Search
After creating several entries, test search:

1. **Emotion Search**: Search "anxious" or "happy"
2. **Topic Search**: Search "work" or "family"
3. **Concept Search**: Search "stressed" (should find anxious entries)
4. **Activity Search**: Search "exercise" (should find gym-related entries)

### 5. Pattern Recognition
Create entries over several days:

Day 1 (Morning): "Feeling great, ready to tackle the day!"
Day 1 (Evening): "Exhausted but accomplished a lot"

Day 2 (Morning): "Woke up tired, didn't sleep well"
Day 2 (Evening): "Better day than expected despite rough start"

Check if:
- Morning/evening patterns are detected
- Mood trends are identified
- Notifications adapt to patterns

### 6. Smart Notifications
Monitor notifications for:
- [ ] Morning check-in adapts to your mood
- [ ] Evening reflection changes based on day's entries
- [ ] Task reminders appear for extracted tasks
- [ ] Tone matches your emotional state

## 🔍 What to Look For

### In the UI:
- Emotion badges on entries
- Search results relevance
- Loading states during AI processing
- Error handling if AI fails

### In Browser Console:
```javascript
// Check for AI processing
console.log('Processing journal entry...')
console.log('Emotion analysis:', result)
console.log('Tasks extracted:', tasks)
```

### In Network Tab:
- `/journal/entry` - Creates entry
- `/journal/process` - AI analysis (may take 2-3 seconds)
- `/journal/search` - Semantic search
- `/journal/context` - User patterns

## 🐛 Common Issues & Solutions

### Issue: No emotion badges showing
**Solution**: AI processing happens async. Wait 5-10 seconds and refresh.

### Issue: Search returns no results
**Solution**: Ensure entries are processed first. Try broader search terms.

### Issue: Voice input not working
**Solution**: 
1. Check browser permissions
2. Must be HTTPS (production) or localhost
3. Try Chrome/Edge for best support

### Issue: Tasks not being extracted
**Solution**: Be more explicit: "I need to..." or "I should..."

## 📊 Performance Benchmarks

- Journal save: < 1 second
- AI processing: 2-5 seconds
- Search results: < 1 second
- Page load: < 2 seconds

## 🧪 Test Data Generator

Quick entries to copy/paste for testing:

```
"Feeling overwhelmed with work deadlines. Need to prioritize better and maybe talk to my manager about workload."

"Great workout this morning! Energy levels are high. Reminder to call dentist about appointment."

"Missing dad today. It's been 6 months since we talked. I should reach out even though it's hard."

"Meditation helped with anxiety today. Want to make this a daily habit. Also need to pick up groceries."

"Job interview went well! Fingers crossed. Need to send thank you email to interviewer."
```

## 📱 Mobile Testing

1. Add to home screen (PWA)
2. Test offline mode (basic features)
3. Voice input on mobile
4. Notification permissions
5. Check responsive design

## 🔐 Security Testing

- [ ] Entries are encrypted (check network tab)
- [ ] Can't access other users' entries
- [ ] Auth token required for all requests
- [ ] Logout clears local data

## 📈 Monitoring

Check AWS CloudWatch for:
- Lambda errors
- Bedrock API calls
- DynamoDB usage
- Cost tracking

## 🎯 Success Criteria

- [ ] Can create and retrieve journal entries
- [ ] AI extracts emotions accurately 80% of time
- [ ] Tasks are detected from natural language
- [ ] Search finds relevant entries
- [ ] No errors in console
- [ ] Performance meets benchmarks