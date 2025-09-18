const mongoose = require('mongoose');

const StreamingPlatformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logo: String,
  baseUrl: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StreamingPlatform', StreamingPlatformSchema);