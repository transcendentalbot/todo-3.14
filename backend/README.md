# Wellness Companion Backend

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- AWS CLI configured with appropriate credentials
- Serverless Framework installed globally: `npm install -g serverless`

### Installation
```bash
cd backend
npm install
```

### Environment Variables
Create a `.env` file in the backend directory:
```
JWT_SECRET=your-secret-key-here
```

### Deployment

#### Deploy to development stage:
```bash
npm run deploy
```

#### Deploy to production:
```bash
npm run deploy:prod
```

### Local Development
```bash
npm run local
```
This will start the serverless-offline plugin on http://localhost:3000

### API Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /user/profile` - Get user profile (requires auth)

#### Tracking (all require auth)
- `POST /tracking/checkin` - Daily check-in (mood, energy, reflections)
- `POST /tracking/photo` - Upload photo (selfie or food)
- `POST /tracking/weight` - Log weight
- `POST /tracking/supplement` - Track supplement intake

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```