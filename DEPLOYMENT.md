# Deployment Guide - AnimeList Tracker

This guide will help you deploy the AnimeList Tracker application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Environment Variables](#environment-variables)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment](#post-deployment)

## Prerequisites

Before deploying, ensure you have:
- Node.js v16 or higher
- A MongoDB Atlas account (or MongoDB instance)
- Git
- Google Gemini API key (optional, for chatbot)

## MongoDB Atlas Setup

### 1. Create a MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free Tier is sufficient to start)

### 2. Configure Database Access
1. In Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Create a username and secure password
4. Grant "Read and write to any database" privileges
5. Save the credentials securely

### 3. Configure Network Access
1. In Atlas, go to "Network Access"
2. Click "Add IP Address"
3. For development: Add your current IP
4. For production: Add `0.0.0.0/0` to allow access from anywhere
   - Note: This is necessary for cloud deployments where IP may change
   - Atlas handles security through authentication

### 4. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority`
5. Replace `<username>`, `<password>`, and `<database>` with your values

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory with:

```env
# Database (REQUIRED)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/anime_tracker?retryWrites=true&w=majority

# Security (REQUIRED)
JWT_SECRET=your_secure_random_string_here_minimum_32_characters

# Server (REQUIRED)
PORT=5000
NODE_ENV=production

# CORS (REQUIRED for production)
FRONTEND_URL=https://your-frontend-domain.com

# Google Gemini (OPTIONAL - for AI chatbot)
GEMINI_API_KEY=your_gemini_api_key_here

# Email (OPTIONAL - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory with:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Generating Secure JWT Secret

Generate a secure random string for JWT_SECRET:
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Deployment Options

### Option 1: Deploy to Render

#### Backend Deployment

1. Push your code to GitHub
2. Go to [Render](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: anime-tracker-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or paid for better performance)

6. Add environment variables:
   - Click "Environment" tab
   - Add all backend environment variables from above
   - Set `NODE_ENV=production`

7. Click "Create Web Service"
8. Note your backend URL (e.g., `https://anime-tracker-backend.onrender.com`)

#### Frontend Deployment

1. In Render, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: anime-tracker-frontend
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

4. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL + `/api`
   - Example: `https://anime-tracker-backend.onrender.com/api`

5. Click "Create Static Site"

### Option 2: Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create anime-tracker-app`

4. Set environment variables:
```bash
heroku config:set MONGODB_URI="your_connection_string"
heroku config:set JWT_SECRET="your_secret"
heroku config:set NODE_ENV="production"
heroku config:set FRONTEND_URL="your_frontend_url"
# Add other variables as needed
```

5. Deploy:
```bash
git push heroku main
```

The Procfile is already configured for Heroku deployment.

### Option 3: Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Sign up and create new project
3. Choose "Deploy from GitHub repo"
4. Select your repository

5. Configure backend service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Add environment variables in Settings

6. Configure frontend service:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build`
   - Add `REACT_APP_API_URL` environment variable

### Option 4: Deploy to Vercel (Frontend) + Render (Backend)

#### Backend on Render
Follow Render backend steps above.

#### Frontend on Vercel
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - Add environment variable: `REACT_APP_API_URL`

4. Deploy

## Post-Deployment

### 1. Create Admin User

SSH into your backend server or run locally with production connection string:

```bash
cd backend
node scripts/createAdmin.js
```

Follow prompts to create admin account.

### 2. Test the Deployment

1. Visit your frontend URL
2. Test registration and login
3. Verify API calls work (check browser console)
4. Test admin features
5. Check health endpoint: `https://your-backend-url.com/health`

### 3. Monitor Application

#### Check Backend Logs
- Render: Dashboard → Logs
- Heroku: `heroku logs --tail`
- Railway: Project → Deployments → View Logs

#### Health Check
Monitor the `/health` endpoint:
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. Set Up Monitoring (Optional)

Consider setting up:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Analytics**: Google Analytics
- **Performance monitoring**: New Relic, Datadog

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Can't connect to MongoDB Atlas

**Solutions**:
1. Check IP whitelist (add `0.0.0.0/0` for cloud deployments)
2. Verify username and password in connection string
3. Ensure database name is specified in connection string
4. Check MongoDB Atlas cluster is running
5. Verify network policies on deployment platform

### CORS Errors

**Problem**: Frontend can't access backend API

**Solutions**:
1. Set `FRONTEND_URL` in backend environment variables
2. Ensure frontend URL matches exactly (no trailing slash)
3. Check CORS configuration in `backend/server.js`
4. Verify API URL in frontend `.env` is correct

### Build Failures

**Problem**: Build or deployment fails

**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and reinstall
3. Check Node.js version (should be v16+)
4. Verify all dependencies are in `package.json`
5. Check build logs for specific errors

### Rate Limiting Issues

**Problem**: "Too many requests" errors

**Solutions**:
1. Rate limits are set to 100 requests per 15 minutes for API
2. Static files have higher limit (200 per 15 minutes)
3. Contact admin to adjust limits in `backend/server.js` if needed
4. Consider implementing caching on frontend

### Environment Variables Not Loading

**Problem**: App not using environment variables

**Solutions**:
1. Verify `.env` file exists in correct directory
2. Restart server after changing environment variables
3. Check deployment platform environment variable settings
4. Ensure `dotenv` is installed and loaded
5. For frontend: Variables must start with `REACT_APP_`

## Security Checklist

Before going live, ensure:
- [ ] Strong JWT_SECRET (32+ characters, random)
- [ ] MongoDB connection uses authentication
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Rate limiting configured
- [ ] CORS properly restricted to your frontend domain
- [ ] No hardcoded secrets in code
- [ ] `.env` files in `.gitignore`
- [ ] Dependencies updated (no vulnerabilities)
- [ ] Admin password is strong
- [ ] File upload limits configured

## Scaling Considerations

As your app grows:
1. **Database**: Upgrade MongoDB Atlas tier for more storage/performance
2. **Backend**: Scale horizontally by adding more instances
3. **CDN**: Use Cloudflare or similar for static assets
4. **Caching**: Implement Redis for session management
5. **Queue**: Add job queue (Bull, RabbitMQ) for long-running tasks
6. **Load Balancer**: Distribute traffic across multiple servers

## Support

For issues:
1. Check application logs
2. Verify environment variables
3. Test locally with production database
4. Review GitHub issues
5. Check deployment platform documentation

## Cost Estimates

### Free Tier (Good for testing/small scale)
- MongoDB Atlas: Free (M0, 512MB)
- Render: Free (spins down after inactivity)
- Vercel: Free (100GB bandwidth)
- **Total: $0/month**

### Production Tier (Good for active users)
- MongoDB Atlas: $9/month (M2 Shared)
- Render: $7/month (Web Service)
- Vercel: Free (or $20/month Pro)
- **Total: $16-36/month**

### High Traffic Tier
- MongoDB Atlas: $57/month (M10 Dedicated)
- Render: $25/month (Pro)
- Vercel: $20/month (Pro)
- **Total: $102/month**

---

**Need Help?** Create an issue on GitHub or contact support.
