const mongoose = require('mongoose');

const AnimeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  alternativeTitles: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true
  },
  genres: [{
    type: String,
    required: true
  }],
  tags: [{
    type: String
  }],
  type: {
    type: String,
    enum: ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'TV Series', 'Web Series'],
    required: true
  },
  category: {
    type: String,
    enum: ['Anime', 'TV Series'],
    default: 'Anime',
    required: true
  },
  status: {
    type: String,
    enum: ['Airing', 'Completed', 'Upcoming'],
    required: true
  },
  episodes: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  studio: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['Manga', 'Light Novel', 'Visual Novel', 'Game', 'Original', 'Other']
  },
  contentRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'R+', 'Rx']
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  poster: {
    type: String,
    required: true
  },
  banner: {
    type: String
  },
  trailer: {
    type: String
  },
  streamingPlatforms: [{
    name: String,
    url: String,
    region: [String]
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  popularity: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  characters: [{
    name: String,
    image: String,
    role: {
      type: String,
      enum: ['Main', 'Supporting', 'Background']
    },
    voiceActor: String
  }],
  staff: [{
    name: String,
    role: String
  }],
  related: [{
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anime'
    },
    relation: {
      type: String,
      enum: ['Sequel', 'Prequel', 'Side Story', 'Alternative Version', 'Summary', 'Other']
    }
  }],
  recommendations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime'
  }]
}, {
  timestamps: true
});

// Index for search functionality
AnimeSchema.index({ title: 'text', description: 'text', genres: 'text' });

module.exports = mongoose.model('Anime', AnimeSchema);
