const express = require('express');
const router = express.Router();
const StreamingPlatform = require('../models/StreamingPlatform');
const AnimeStreaming = require('../models/AnimeStreaming');
const { auth, adminAuth } = require('../middleware/auth');

// Get all streaming platforms
router.get('/platforms', async (req, res) => {
  try {
    const platforms = await StreamingPlatform.find({ isActive: true });
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get streaming links for anime
router.get('/anime/:animeId', async (req, res) => {
  try {
    const streamingLinks = await AnimeStreaming.find({
      animeId: req.params.animeId,
      isAvailable: true
    }).populate('platformId');
    res.json(streamingLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Add streaming platform
router.post('/platforms', adminAuth, async (req, res) => {
  try {
    const platform = new StreamingPlatform(req.body);
    await platform.save();
    res.status(201).json(platform);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Add streaming link for anime
router.post('/anime/:animeId/link', adminAuth, async (req, res) => {
  try {
    const streamingLink = new AnimeStreaming({
      animeId: req.params.animeId,
      ...req.body
    });
    await streamingLink.save();
    await streamingLink.populate('platformId');
    res.status(201).json(streamingLink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update streaming link
router.put('/links/:id', adminAuth, async (req, res) => {
  try {
    const streamingLink = await AnimeStreaming.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('platformId');
    res.json(streamingLink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Delete streaming link
router.delete('/links/:id', adminAuth, async (req, res) => {
  try {
    await AnimeStreaming.findByIdAndDelete(req.params.id);
    res.json({ message: 'Streaming link deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;