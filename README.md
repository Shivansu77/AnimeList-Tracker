# AnimeList-Tracker

A full-stack MERN (MongoDB, Express, React, Node.js) application for tracking and managing your anime watchlist with advanced features like clubs, reviews, chatbot recommendations, and reminders.

## Features

- 🎬 Anime tracking with watchlist management
- 👥 Social clubs for anime enthusiasts
- ⭐ Reviews and ratings system
- 🤖 AI-powered chatbot for recommendations (powered by Google Gemini)
- 🔔 Episode reminders and notifications
- 📊 Analytics and statistics dashboard
- 🔐 Secure authentication with JWT
- 👤 User profiles and social features
- 📺 Streaming platform integration
- 🔗 Shareable watchlists

## Tech Stack

### Frontend
- React 19
- Material-UI (MUI)
- React Router
- Axios
- Chart.js & Recharts

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Google Gemini AI
- Node-cron for scheduling

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API Key (optional, for chatbot feature)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/Shivansu77/AnimeList-Tracker.git
cd AnimeList-Tracker
```

### 2. Install dependencies

Install all dependencies for both frontend and backend:
```bash
npm run install-all
```

Or install separately:
```bash
# Backend
npm run install-backend

# Frontend
npm run install-frontend
```

### 3. Environment Configuration

#### Backend Configuration
Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# MongoDB Atlas connection string (user will configure)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/anime_tracker

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Google Gemini API (optional, for chatbot)
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Email Configuration (optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

#### Frontend Configuration
Create a `.env` file in the `frontend` directory:
```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Create Admin User (Optional)

To create an admin user for managing content:
```bash
cd backend
npm run create-admin
```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run separately:
```bash
# Backend only (from root directory)
npm run backend

# Frontend only (from root directory)
npm run frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### Production Mode

#### 1. Build the frontend
```bash
npm run build
```

#### 2. Set environment variables
Update your `.env` files with production values:

Backend `.env`:
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
FRONTEND_URL=https://your-production-domain.com
```

Frontend `.env`:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

#### 3. Start the server
```bash
npm start
```

## Deployment

### Deploying to Render/Heroku/Railway

1. **Backend Deployment**:
   - Set all environment variables from `.env.example`
   - Set `NODE_ENV=production`
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`

2. **Frontend Deployment**:
   - Set `REACT_APP_API_URL` to your backend URL
   - Build command: `cd frontend && npm install && npm run build`
   - Serve the `build` directory

3. **Database**:
   - Use MongoDB Atlas for production
   - Add your deployment IP to Atlas whitelist
   - Use connection string with authentication

### Environment Variables Summary

#### Required Backend Variables:
- `MONGODB_URI` - MongoDB connection string (Atlas recommended for production)
- `JWT_SECRET` - Secure random string for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Your frontend URL for CORS

#### Optional Backend Variables:
- `GEMINI_API_KEY` - For AI chatbot feature
- `SMTP_*` - For email notifications

#### Required Frontend Variables:
- `REACT_APP_API_URL` - Backend API URL

## API Documentation

### Health Check
```
GET /health
Response: { status: 'ok', message: 'Server is running', timestamp: '...' }
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Anime
- `GET /api/anime` - Get all anime
- `GET /api/anime/:id` - Get anime by ID
- `POST /api/anime` - Create anime (admin only)
- `PUT /api/anime/:id` - Update anime (admin only)
- `DELETE /api/anime/:id` - Delete anime (admin only)

### Watchlist
- `POST /api/anime/:id/watchlist` - Add to watchlist
- `DELETE /api/anime/:id/watchlist` - Remove from watchlist
- `PUT /api/anime/:id/progress` - Update watch progress

### More endpoints available - see route files in `backend/routes/`

## Project Structure

```
AnimeList-Tracker/
├── backend/
│   ├── middleware/      # Authentication & validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── scripts/         # Utility scripts
│   └── server.js        # Express server
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── context/     # React context providers
│       ├── pages/       # Page components
│       └── services/    # API services
└── package.json         # Root package config
```

## Features Guide

### User Features
- Create account and manage profile
- Search and browse anime
- Add anime to watchlist with status (watching, completed, plan to watch, etc.)
- Rate and review anime
- Track watch progress
- Join clubs and participate in discussions
- Get AI-powered recommendations
- Set episode reminders
- Share watchlist with others

### Admin Features
- Add and manage anime entries
- Manage episodes and streaming platforms
- Monitor user activity
- Handle reports and moderation

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (local) or Atlas cluster is accessible
- Check IP whitelist in Atlas (use `0.0.0.0/0` for all IPs or specific IPs)
- Verify connection string format
- Check firewall settings

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Build Errors
```bash
# Clear caches and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
rm -f package-lock.json backend/package-lock.json frontend/package-lock.json
npm run install-all
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please create an issue on GitHub.

## Notes for Deployment

- **Database**: User will configure MongoDB Atlas connection themselves
- **Environment Variables**: All sensitive credentials should be set via environment variables
- **Security**: Change default JWT_SECRET to a secure random string
- **API Keys**: Gemini API key is optional but required for chatbot functionality
- **CORS**: Update FRONTEND_URL for production deployment
- **Health Monitoring**: Use `/health` endpoint for uptime monitoring
