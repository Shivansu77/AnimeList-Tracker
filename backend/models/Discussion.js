const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  anime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime'
  },
  category: {
    type: String,
    enum: ['General', 'Episode Discussion', 'Character Discussion', 'Theory', 'News', 'Recommendation'],
    default: 'General'
  },
  tags: [{
    type: String
  }],
  hasSpoilers: {
    type: Boolean,
    default: false
  },
  spoilerEpisode: {
    type: Number,
    min: [1, 'Episode number must be at least 1'],
    validate: {
      validator: function(v) {
        return !this.hasSpoilers || (v && v > 0);
      },
      message: 'Spoiler episode is required when hasSpoilers is true'
    }
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  postCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Discussion', DiscussionSchema);
