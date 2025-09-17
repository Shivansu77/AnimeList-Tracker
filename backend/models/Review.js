const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  anime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
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
  spoilerWarning: {
    type: Boolean,
    default: false
  },
  categories: {
    story: {
      type: Number,
      min: 1,
      max: 10
    },
    animation: {
      type: Number,
      min: 1,
      max: 10
    },
    sound: {
      type: Number,
      min: 1,
      max: 10
    },
    character: {
      type: Number,
      min: 1,
      max: 10
    },
    enjoyment: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRecommended: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per anime
ReviewSchema.index({ user: 1, anime: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
