# Wellness Companion Frontend

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- Backend API running (see backend/README.md)

### Installation
```bash
cd frontend
npm install
```

### Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update the API URL if needed in `.env`:
```
VITE_API_URL=http://localhost:3000/dev
```

### Development
```bash
npm run dev
```
The app will be available at http://localhost:3000

### Build for Production
```bash
npm run build
```

### Features Implemented

#### Authentication
- Login screen with email/password
- Registration with password validation
- JWT token management
- Protected routes

#### Core Screens
1. **Dashboard**
   - Greeting based on time of day
   - Quick action buttons
   - Today's summary
   - Streak counter

2. **Daily Check-in**
   - Mood rating (1-10 scale)
   - Energy level tracking
   - Voice journaling
   - Evening reflections:
     - "What brought joy today?"
     - "What was challenging?"

3. **Quick Log**
   - Weight tracking with units
   - Supplement tracking (Yes/No)
   - Photo capture (selfie/food)

#### PWA Features
- Installable on mobile devices
- Offline support with service workers
- Mobile-optimized UI
- Touch-friendly interactions

#### Voice Features
- Speech-to-text for all text inputs
- Real-time transcription
- Visual recording indicator

### Browser Support
- Chrome/Edge (recommended)
- Safari (iOS)
- Firefox

Note: Voice features require modern browser support for Web Speech API.