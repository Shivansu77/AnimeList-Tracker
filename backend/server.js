const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

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

// Start reminder scheduler
require('./services/reminderScheduler');

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
