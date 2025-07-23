# Wellness Companion

A comprehensive PWA-based wellness tracking application that serves as your personal health and mindset companion.

## 🌟 Features

### Current (Phase 1)
- **Voice-First Input**: All interactions can be completed via voice
- **Daily Mood & Energy Tracking**: Rate your mood and energy levels
- **Happiness Journaling**: Explore what brings you joy with guided prompts
- **Photo Documentation**: Capture selfies and meals
- **Weight & Supplement Tracking**: Quick logging with minimal friction
- **Push Notifications**: Timely reminders that work on locked phones
- **Client-Side Encryption**: Your data is encrypted before leaving your device
- **Offline Support**: Works without internet connection
- **Mobile PWA**: Installable on phones with native-like experience

### Coming Soon (Phase 2)
- **AI Journal Analysis**: Understands emotions and extracts tasks from your entries
- **Smart Reminders**: Notifications that adapt to your patterns and needs
- **Contextual Support**: System learns what helps you and when you need it most

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run deploy  # Deploy to AWS
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Start development server
```

## 📁 Project Structure

```
wellness-companion/
├── backend/          # Serverless AWS backend
│   ├── functions/    # Lambda functions
│   ├── utils/        # Shared utilities
│   └── serverless.yml
├── frontend/         # React PWA
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   └── contexts/
│   └── vite.config.ts
└── .claude/          # Claude commands
    └── commands/
```

## 🛠️ Tech Stack

### Backend
- AWS Lambda + API Gateway
- DynamoDB for data storage
- S3 for photo storage
- Serverless Framework
- TypeScript

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- PWA with Service Workers
- Web Speech API

## 📱 Key User Flows

1. **Morning Routine**: Check-in → Mood → Energy → Voice note → Selfie
2. **Meal Tracking**: Open app → Camera → Capture → Save
3. **Evening Reflection**: Journal prompts → Voice responses → Save

## 🔒 Security

- Password-protected access
- JWT authentication
- HTTPS only
- Encrypted data transmission

## 📈 Project Status

### ✅ Phase 1 (MVP) - In Progress
- Backend infrastructure ✅
- Core PWA with tracking features ✅
- Voice input integration ✅
- Basic authentication ✅
- Push notifications ✅
- Client-side encryption ✅
- Scheduled reminders ✅
- SMS backup for critical alerts ✅

### 🚧 Phase 2 (Journal Intelligence) - Planned
- AI-powered journal analysis using AWS Bedrock
- Intelligent task and emotion extraction
- Context-aware adaptive notifications
- Semantic search across journal entries
- Pattern recognition for mood and wellness
- Personalized insights and recommendations

### 🔮 Future Phases
- Apple Health / Google Fit integration
- Advanced analytics dashboard
- Social features and accountability
- Data export and portability

## 🤝 Contributing

This is a private project. See CLAUDE.md for development guidelines.

## 📄 License

Private - All rights reserved