const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animeId: {
    type: String,
    required: true
  },
  episodeNumber: {
    type: Number,
    default: 1
  },
  reminderTime: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['next_episode', 'anime_start', 'custom_schedule'],
    default: 'next_episode'
  },
  customSchedule: {
    dayOfWeek: Number,
    time: String
  },
  isSent: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reminder', ReminderSchema);