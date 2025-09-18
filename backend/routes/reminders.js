const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const Episode = require('../models/Episode');
const { auth } = require('../middleware/auth');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Reminders API is working' });
});

// Get user reminders
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ 
      userId: req.user.userId, 
      isActive: true,
      isSent: false
    }).sort({ reminderTime: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create reminder
router.post('/', auth, async (req, res) => {
  try {
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    
    const { type, animeId, episodeNumber, customSchedule } = req.body;
    
    if (!animeId) {
      return res.status(400).json({ message: 'Anime ID is required' });
    }
    
    // Simple reminder time - 5 minutes from now for testing
    const reminderTime = new Date(Date.now() + 5 * 60 * 1000);
    
    const reminder = new Reminder({
      userId: req.user.userId,
      animeId: animeId.toString(),
      episodeNumber: episodeNumber || 1,
      type: type || 'next_episode',
      customSchedule,
      reminderTime
    });
    
    const savedReminder = await reminder.save();
    console.log('Reminder saved:', savedReminder);
    res.status(201).json(savedReminder);
  } catch (error) {
    console.error('Reminder creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    await Reminder.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending notifications
router.get('/pending', auth, async (req, res) => {
  try {
    const now = new Date();
    const reminders = await Reminder.find({
      userId: req.user.userId,
      isActive: true,
      isSent: true,
      reminderTime: { $gte: new Date(now.getTime() - 5 * 60 * 1000) } // Last 5 minutes
    }).populate('animeId');
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await Reminder.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;