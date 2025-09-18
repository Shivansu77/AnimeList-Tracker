const express = require('express');
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth');
const router = express.Router();

// POST /api/comments - Create comment with spoiler protection
router.post('/', auth, async (req, res) => {
  try {
    const { anime, content, isSpoiler, parentComment } = req.body;
    
    const comment = new Comment({
      user: req.user.userId,
      anime,
      content,
      isSpoiler: isSpoiler || false,
      parentComment
    });
    
    await comment.save();
    await comment.populate('user', 'username');
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/comments/:animeId - Get comments for anime
router.get('/:animeId', async (req, res) => {
  try {
    const comments = await Comment.find({ anime: req.params.animeId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;