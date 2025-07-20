# Wellness Companion - Test Checklist

## 🚀 Setup
- [ ] Run `./test-setup.sh` to install dependencies
- [ ] Start backend: `cd backend && npm run local`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Open http://localhost:3000 in browser

## 🔐 Authentication Tests
- [ ] Register new account
  - [ ] Email validation works
  - [ ] Password must be 8+ characters
  - [ ] Success redirects to dashboard
- [ ] Login with existing account
  - [ ] Invalid credentials show error
  - [ ] Valid login redirects to dashboard
- [ ] Logout functionality
- [ ] Protected routes redirect to login when not authenticated

## 📱 Dashboard Tests
- [ ] Greeting changes based on time of day
- [ ] All quick action buttons are visible
- [ ] Navigation to each section works

## 😊 Daily Check-in Tests
- [ ] Mood slider (1-10) works
- [ ] Energy slider (1-10) works
- [ ] Voice input button appears
- [ ] Text input fallback works
- [ ] Evening check-in shows reflection prompts
- [ ] Submit saves successfully

## ⚖️ Quick Log Tests
- [ ] Weight Tab
  - [ ] Number input accepts decimals
  - [ ] Unit switcher (lbs/kg) works
  - [ ] Submit saves weight
- [ ] Supplement Tab
  - [ ] Yes/No buttons work
  - [ ] Submit saves selection
- [ ] Photo Tab
  - [ ] Camera button opens file picker
  - [ ] Preview shows after selection
  - [ ] Can switch between selfie/food types

## 🎤 Voice Input Tests
- [ ] Microphone button visible
- [ ] Permission prompt appears on first use
- [ ] Recording indicator shows when active
- [ ] Speech converts to text
- [ ] Text can be edited manually

## 📱 PWA Tests
- [ ] App is installable on mobile
- [ ] Icons appear correctly
- [ ] Offline page loads (basic functionality)
- [ ] App opens in standalone mode

## 🐛 Known Issues to Fix
- [ ] 
- [ ] 
- [ ] 

## 📝 Notes
- Voice input requires HTTPS or localhost
- Some features may not work in all browsers
- Test on both desktop and mobile