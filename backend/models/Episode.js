const mongoose = require('mongoose');

const EpisodeSchema = new mongoose.Schema({
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: true
  },
  episodeNumber: {
    type: Number,
    required: true
  },
  title: String,
  releaseDate: {
    type: Date,
    required: true
  },
  duration: Number,
  isReleased: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Episode', EpisodeSchema);