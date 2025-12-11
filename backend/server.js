const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const animeRoutes = require('./routes/anime');
const usersRoutes = require('./routes/users');
const clubsRoutes = require('./routes/clubs');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const chatbotRoutes = require('./routes/chatbot');
const reminderRoutes = require('./routes/reminders');
const episodeRoutes = require('./routes/episodes');
const streamingRoutes = require('./routes/streaming');
const watchlistShareRoutes = require('./routes/watchlistShare');

const app = express();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const API_RATE_LIMIT = 100; // requests per window
const STATIC_RATE_LIMIT = 200; // higher limit for static files

// Rate limiting middleware for API routes
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: API_RATE_LIMIT,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-tracker')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/comments', require('./routes/comments'));
app.use('/api/spoiler-reports', require('./routes/spoilerReports'));
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/posts', require('./routes/posts'));
app.use('/api/reminders', reminderRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/watchlist-share', watchlistShareRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start reminder scheduler
require('./services/reminderScheduler');

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  
  // Serve static files with security headers
  app.use(express.static(buildPath, {
    maxAge: '1d',
    etag: true
  }));
  
  // Rate limiter for static file serving (prevents abuse of SPA routes)
  const staticLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: STATIC_RATE_LIMIT,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Handle React routing - return index.html for all non-API routes
  app.get('*', staticLimiter, (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Unable to load application. Please try again later.');
      }
    });
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
