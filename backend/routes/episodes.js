const express = require('express');
const router = express.Router();
const Episode = require('../models/Episode');
const { auth, adminAuth } = require('../middleware/auth');

// Get episodes for anime
router.get('/anime/:animeId', async (req, res) => {
  try {
    const episodes = await Episode.find({ animeId: req.params.animeId })
      .sort({ episodeNumber: 1 });
    res.json(episodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get next episode for anime
router.get('/anime/:animeId/next', async (req, res) => {
  try {
    const now = new Date();
    const nextEpisode = await Episode.findOne({
      animeId: req.params.animeId,
      releaseDate: { $gt: now },
      isReleased: false
    }).sort({ episodeNumber: 1 });
    
    res.json(nextEpisode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Add episode
router.post('/', adminAuth, async (req, res) => {
  try {
    const episode = new Episode(req.body);
    await episode.save();
    res.status(201).json(episode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update episode
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const episode = await Episode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(episode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;