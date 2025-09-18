const mongoose = require('mongoose');

const AnimeStreamingSchema = new mongoose.Schema({
  animeId: {
    type: String,
    required: true
  },
  platformId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StreamingPlatform',
    required: true
  },
  streamingUrl: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  region: {
    type: String,
    default: 'US'
  },
  subscriptionRequired: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AnimeStreaming', AnimeStreamingSchema);