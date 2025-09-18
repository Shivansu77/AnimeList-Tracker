const express = require('express');
const User = require('../models/User');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is already taken (if changing username)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's watchlist
router.get('/watchlist', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const user = await User.findById(req.user.userId)
      .populate('watchlist.anime', 'title poster episodes averageRating genres type status');

    let watchlist = user.watchlist;
    
    // Filter by status if provided
    if (status && status !== 'all') {
      watchlist = watchlist.filter(entry => entry.status === status);
    }

    // Sort by last updated
    watchlist.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(watchlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent reviews
router.get('/recent-reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username')
      .populate('anime', 'title')
      .sort({ createdAt: -1 })
      .limit(3);

    if (reviews.length > 0) {
      const formattedReviews = reviews.map(review => ({
        title: review.anime.title,
        author: review.user.username,
        rating: review.rating,
        excerpt: review.content.length > 100 ? review.content.substring(0, 100) + '...' : review.content,
        avatar: review.user.username.charAt(0).toUpperCase()
      }));
      return res.json(formattedReviews);
    }

    // Return sample reviews if no real reviews exist
    res.json([
      {
        title: 'Attack on Titan',
        author: 'admin',
        rating: 2,
        excerpt: 'good anime',
        avatar: 'A'
      },
      {
        title: 'Demon Slayer',
        author: 'AnimeExpert2024',
        rating: 9,
        excerpt: 'Amazing animation and character development throughout the series.',
        avatar: 'A'
      },
      {
        title: 'One Piece',
        author: 'MangaReader',
        rating: 10,
        excerpt: 'Epic adventure with incredible world-building and storytelling.',
        avatar: 'M'
      }
    ]);
  } catch (error) {
    console.error(error);
    res.json([
      {
        title: 'Attack on Titan',
        author: 'admin',
        rating: 2,
        excerpt: 'good anime',
        avatar: 'A'
      }
    ]);
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('watchlist.anime');
    
    const stats = {
      totalAnime: user.watchlist.length,
      watching: user.watchlist.filter(entry => entry.status === 'watching').length,
      completed: user.watchlist.filter(entry => entry.status === 'completed').length,
      onHold: user.watchlist.filter(entry => entry.status === 'on-hold').length,
      dropped: user.watchlist.filter(entry => entry.status === 'dropped').length,
      planToWatch: user.watchlist.filter(entry => entry.status === 'plan-to-watch').length,
      totalEpisodesWatched: user.watchlist.reduce((total, entry) => total + (entry.episodesWatched || 0), 0),
      averageRating: 0,
      favoriteGenres: []
    };

    // Calculate average rating
    const ratedEntries = user.watchlist.filter(entry => entry.rating);
    if (ratedEntries.length > 0) {
      stats.averageRating = ratedEntries.reduce((sum, entry) => sum + entry.rating, 0) / ratedEntries.length;
    }

    // Calculate favorite genres
    const genreCount = {};
    user.watchlist.forEach(entry => {
      if (entry.anime && entry.anime.genres) {
        entry.anime.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    stats.favoriteGenres = Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .slice(0, 5)
      .map(genre => ({ name: genre, count: genreCount[genre] }));

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email')
      .populate('watchlist.anime', 'title poster')
      .populate('clubs', 'name avatar memberCount');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate public stats
    const publicStats = {
      totalAnime: user.watchlist.length,
      completed: user.watchlist.filter(entry => entry.status === 'completed').length,
      watching: user.watchlist.filter(entry => entry.status === 'watching').length,
      totalEpisodesWatched: user.watchlist.reduce((total, entry) => total + (entry.episodesWatched || 0), 0)
    };

    res.json({
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      joinedAt: user.createdAt,
      stats: publicStats,
      clubs: user.clubs,
      recentActivity: user.watchlist
        .filter(entry => entry.updatedAt)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    })
    .select('username avatar bio')
    .limit(parseInt(limit));

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add friend
router.post('/friends/:userId', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user.userId) {
      return res.status(400).json({ message: 'Cannot add yourself as friend' });
    }

    // Check if already friends
    if (currentUser.friends.includes(req.params.userId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    currentUser.friends.push(req.params.userId);
    targetUser.friends.push(req.user.userId);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove friend
router.delete('/friends/:userId', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    currentUser.friends = currentUser.friends.filter(
      friendId => friendId.toString() !== req.params.userId
    );
    
    targetUser.friends = targetUser.friends.filter(
      friendId => friendId.toString() !== req.user.userId
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friends list
router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('friends', 'username avatar bio')
      .select('friends');

    res.json(user.friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
