const express = require('express');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');
const router = express.Router();

// POST /api/reviews - Create review with spoiler protection
router.post('/', auth, async (req, res) => {
  try {
    const { anime, rating, content, isSpoiler } = req.body;
    
    const review = new Review({
      user: req.user.userId,
      anime,
      rating,
      content,
      isSpoiler: isSpoiler || false
    });
    
    await review.save();
    await review.populate('user', 'username');
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/reviews/:animeId - Get reviews for anime
router.get('/:animeId', async (req, res) => {
  try {
    const reviews = await Review.find({ anime: req.params.animeId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;