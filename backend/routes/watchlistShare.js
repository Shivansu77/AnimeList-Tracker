const express = require('express');
const router = express.Router();
const WatchlistShare = require('../models/WatchlistShare');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Generate share token and make watchlist public
router.post('/share', auth, async (req, res) => {
  try {
    const shareToken = uuidv4();
    
    let watchlistShare = await WatchlistShare.findOne({ userId: req.user.userId });
    
    if (watchlistShare) {
      watchlistShare.isPublic = true;
      watchlistShare.shareToken = shareToken;
    } else {
      watchlistShare = new WatchlistShare({
        userId: req.user.userId,
        isPublic: true,
        shareToken
      });
    }
    
    await watchlistShare.save();
    
    res.json({
      shareToken,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/watchlist/${shareToken}`
    });
  } catch (error) {
    console.error('Share watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Revoke sharing
router.delete('/share', auth, async (req, res) => {
  try {
    await WatchlistShare.findOneAndUpdate(
      { userId: req.user.userId },
      { isPublic: false, shareToken: null }
    );
    
    res.json({ message: 'Sharing revoked successfully' });
  } catch (error) {
    console.error('Revoke sharing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shared watchlist by token
router.get('/:shareToken', async (req, res) => {
  try {
    const watchlistShare = await WatchlistShare.findOne({
      shareToken: req.params.shareToken,
      isPublic: true
    }).populate('userId', 'username');
    
    if (!watchlistShare) {
      return res.status(404).json({ message: 'Watchlist not found or not public' });
    }
    
    const user = await User.findById(watchlistShare.userId._id)
      .populate('watchlist.anime', 'title poster genres averageRating episodes type status');
    
    const watchlistData = {
      username: user.username,
      watchlist: user.watchlist.map(item => ({
        anime: item.anime,
        status: item.status,
        episodesWatched: item.episodesWatched,
        rating: item.rating,
        startDate: item.startDate,
        endDate: item.endDate
      }))
    };
    
    res.json(watchlistData);
  } catch (error) {
    console.error('Get shared watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's sharing status
router.get('/status/me', auth, async (req, res) => {
  try {
    const watchlistShare = await WatchlistShare.findOne({ userId: req.user.userId });
    
    if (!watchlistShare) {
      return res.json({ isPublic: false, shareToken: null });
    }
    
    res.json({
      isPublic: watchlistShare.isPublic,
      shareToken: watchlistShare.shareToken,
      shareUrl: watchlistShare.shareToken 
        ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/watchlist/${watchlistShare.shareToken}`
        : null
    });
  } catch (error) {
    console.error('Get sharing status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;