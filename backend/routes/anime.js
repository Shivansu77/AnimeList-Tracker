const express = require('express');
const Anime = require('../models/Anime');
const User = require('../models/User');
const Review = require('../models/Review');
const { auth, admin } = require('../middleware/auth');
const { generateRecommendations } = require('../services/geminiService');

const router = express.Router();

// Search anime - MUST be before /:id route
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({ results: [] });
    }

    const query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { alternativeTitles: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { genres: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    const results = await Anime.find(query)
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(Math.min(parseInt(limit, 10), 20))
      .select('title poster type episodes averageRating genres');

    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ results: [] });
  }
});

// Create new anime (Admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const {
      title,
      description,
      poster,
      banner,
      genres,
      type,
      status,
      episodes,
      duration,
      releaseDate,
      studio,
      source,
      rating,
      trailer,
      streamingPlatforms
    } = req.body;

    // Validation
    if (!title || !description || !genres || !type || !poster || !studio) {
      return res.status(400).json({ message: 'Title, description, genres, type, poster, and studio are required' });
    }

    // Convert duration string to number (extract minutes)
    let durationMinutes = 24; // default
    if (duration) {
      const match = duration.match(/\d+/);
      if (match) {
        durationMinutes = parseInt(match[0]);
      }
    }

    const anime = new Anime({
      title,
      description,
      poster: poster || 'https://via.placeholder.com/300x400',
      banner,
      genres: Array.isArray(genres) ? genres : [genres],
      type,
      status: status || 'Completed',
      episodes: parseInt(episodes) || 1,
      duration: durationMinutes,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      studio,
      source,
      rating,
      trailer,
      streamingPlatforms: streamingPlatforms || []
    });

    await anime.save();
    res.status(201).json({ message: 'Anime created successfully', anime });
  } catch (error) {
    console.error('Anime creation error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update anime (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const anime = await Anime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    res.json({ message: 'Anime updated successfully', anime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete anime (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const anime = await Anime.findByIdAndDelete(req.params.id);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    res.json({ message: 'Anime deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all anime with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      q: search,
      genre,
      type,
      status,
      year,
      sort = 'popularity'
    } = req.query;

    const query = {};
    
    // Search functionality
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    // Filter by genre
    if (genre) {
      query.genres = { $in: [genre] };
    }
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by year
    if (year) {
      query.releaseDate = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`)
      };
    }

    // Sorting options
    let sortOption = {};
    switch (sort) {
      case 'title':
        sortOption = { title: 1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      case 'start_date':
        sortOption = { releaseDate: -1 };
        break;
      case 'popularity':
      default:
        sortOption = { popularity: -1 };
        break;
    }

    const anime = await Anime.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title poster genres type status episodes averageRating releaseDate studio');

    const total = await Anime.countDocuments(query);

    res.json({
      anime,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single anime by ID
router.get('/:id', async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id)
      .populate('reviews', 'user rating title content createdAt')
      .populate('related.anime', 'title poster');

    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    res.json(anime);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update episode progress
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { episodesWatched } = req.body;
    
    const user = await User.findById(req.user.userId);
    const anime = await Anime.findById(req.params.id);
    
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    const watchlistEntry = user.watchlist.find(
      entry => entry.anime.toString() === req.params.id
    );

    if (!watchlistEntry) {
      return res.status(404).json({ message: 'Anime not in watchlist' });
    }

    // Update progress
    watchlistEntry.episodesWatched = Math.min(episodesWatched, anime.episodes);
    
    // Auto-update status based on progress
    if (watchlistEntry.episodesWatched === 0) {
      watchlistEntry.status = 'plan-to-watch';
    } else if (watchlistEntry.episodesWatched >= anime.episodes) {
      watchlistEntry.status = 'completed';
      watchlistEntry.endDate = new Date();
    } else {
      watchlistEntry.status = 'watching';
      if (!watchlistEntry.startDate) {
        watchlistEntry.startDate = new Date();
      }
    }

    await user.save();

    res.json({ 
      message: 'Progress updated successfully',
      episodesWatched: watchlistEntry.episodesWatched,
      totalEpisodes: anime.episodes,
      status: watchlistEntry.status,
      remaining: anime.episodes - watchlistEntry.episodesWatched
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add anime to watchlist
router.post('/:id/watchlist', auth, async (req, res) => {
  try {
    const { status = 'plan-to-watch', episodesWatched = 0, rating, notes } = req.body;
    
    const user = await User.findById(req.user.userId);
    const anime = await Anime.findById(req.params.id);
    
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    // Check if anime is already in watchlist
    const existingEntry = user.watchlist.find(
      entry => entry.anime.toString() === req.params.id
    );

    if (existingEntry) {
      // Update existing entry
      existingEntry.status = status;
      existingEntry.episodesWatched = episodesWatched;
      if (rating) existingEntry.rating = rating;
      if (notes) existingEntry.notes = notes;
      
      if (status === 'watching' && !existingEntry.startDate) {
        existingEntry.startDate = new Date();
      }
      if (status === 'completed' && !existingEntry.endDate) {
        existingEntry.endDate = new Date();
      }
    } else {
      // Add new entry
      const watchlistEntry = {
        anime: req.params.id,
        status,
        episodesWatched,
        rating,
        notes
      };
      
      if (status === 'watching') {
        watchlistEntry.startDate = new Date();
      }
      if (status === 'completed') {
        watchlistEntry.endDate = new Date();
      }
      
      user.watchlist.push(watchlistEntry);
    }

    await user.save();

    res.json({ message: 'Watchlist updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove anime from watchlist
router.delete('/:id/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    user.watchlist = user.watchlist.filter(
      entry => entry.anime.toString() !== req.params.id
    );
    
    await user.save();

    res.json({ message: 'Anime removed from watchlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming anime
router.get('/upcoming', async (req, res) => {
  try {
    const upcoming = await Anime.find({ status: 'Upcoming' })
      .sort({ releaseDate: 1 })
      .limit(5)
      .select('title poster type episodes averageRating genres releaseDate');

    if (upcoming.length === 0) {
      return res.json([
        { _id: '1', title: 'Solo Leveling Season 2', poster: 'https://via.placeholder.com/200x240', type: 'TV', episodes: 12, averageRating: 9.2, genres: ['Action', 'Fantasy'], releaseDate: new Date('2024-12-01') },
        { _id: '2', title: 'Attack on Titan: Final Season Part 4', poster: 'https://via.placeholder.com/200x240', type: 'TV', episodes: 6, averageRating: 9.5, genres: ['Action', 'Drama'], releaseDate: new Date('2024-11-15') }
      ]);
    }

    res.json(upcoming);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Get all-time favorites
router.get('/favorites', async (req, res) => {
  try {
    const favorites = await Anime.find({ averageRating: { $gte: 8.5 } })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(5)
      .select('title poster type episodes averageRating genres releaseDate');

    if (favorites.length === 0) {
      return res.json([
        { _id: '1', title: 'Fullmetal Alchemist: Brotherhood', poster: 'https://via.placeholder.com/200x240', type: 'TV', episodes: 64, averageRating: 9.8, genres: ['Action', 'Adventure'], releaseDate: new Date('2009-04-05') },
        { _id: '2', title: 'Attack on Titan', poster: 'https://via.placeholder.com/200x240', type: 'TV', episodes: 25, averageRating: 9.6, genres: ['Action', 'Drama'], releaseDate: new Date('2013-04-07') },
        { _id: '3', title: 'Death Note', poster: 'https://via.placeholder.com/200x240', type: 'TV', episodes: 37, averageRating: 9.4, genres: ['Thriller', 'Supernatural'], releaseDate: new Date('2006-10-04') }
      ]);
    }

    res.json(favorites);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Get trending anime
router.get('/trending/now', async (req, res) => {
  try {
    const trending = await Anime.find({ status: 'Airing' })
      .sort({ popularity: -1 })
      .limit(10)
      .select('title poster genres averageRating episodes');

    res.json(trending);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top rated anime
router.get('/top/rated', async (req, res) => {
  try {
    const topRated = await Anime.find({ totalRatings: { $gte: 100 } })
      .sort({ averageRating: -1 })
      .limit(10)
      .select('title poster genres averageRating totalRatings');

    res.json(topRated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate anime
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be between 1 and 10' });
    }

    const anime = await Anime.findById(req.params.id);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    // Check if user already rated this anime
    const existingRatingIndex = anime.ratings.findIndex(
      r => r.user.toString() === req.user.userId
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      anime.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      anime.ratings.push({
        user: req.user.userId,
        rating: rating
      });
    }

    // Recalculate average rating
    const totalRatings = anime.ratings.length;
    const sumRatings = anime.ratings.reduce((sum, r) => sum + r.rating, 0);
    anime.averageRating = sumRatings / totalRatings;
    anime.totalRatings = totalRatings;

    await anime.save();

    res.json({ 
      message: 'Rating submitted successfully',
      averageRating: anime.averageRating,
      totalRatings: anime.totalRatings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI-powered recommendations for user
router.get('/recommendations/for-me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('watchlist.anime');
    
    if (!user.watchlist || user.watchlist.length === 0) {
      // New user - recommend popular anime
      const popular = await Anime.find({ averageRating: { $gte: 8 } })
        .sort({ averageRating: -1, totalRatings: -1 })
        .limit(10)
        .select('title poster genres averageRating totalRatings');
      return res.json({ 
        recommendations: popular, 
        reason: 'Popular picks for new users',
        source: 'popular'
      });
    }

    // Analyze user preferences
    const userProfile = {
      favoriteGenres: {},
      preferredTypes: {},
      ratingPattern: [],
      completionRate: 0
    };

    // Analyze user preferences
    let totalCompleted = 0;
    user.watchlist.forEach(entry => {
      if (!entry.anime) return; // Skip null anime entries
      
      // Genre preference with weighted scoring
      const weight = entry.rating ? entry.rating / 10 : 0.5;
      entry.anime.genres?.forEach(genre => {
        userProfile.favoriteGenres[genre] = (userProfile.favoriteGenres[genre] || 0) + weight;
      });
      
      // Type preference
      if (entry.anime.type) {
        userProfile.preferredTypes[entry.anime.type] = (userProfile.preferredTypes[entry.anime.type] || 0) + 1;
      }
      
      // Rating pattern
      if (entry.rating) userProfile.ratingPattern.push(entry.rating);
      
      // Completion tracking
      if (entry.status === 'completed') totalCompleted++;
    });

    userProfile.completionRate = totalCompleted / user.watchlist.length;
    const avgUserRating = userProfile.ratingPattern.length > 0 
      ? userProfile.ratingPattern.reduce((a, b) => a + b, 0) / userProfile.ratingPattern.length 
      : 7;

    // Get top preferences
    const topGenres = Object.keys(userProfile.favoriteGenres)
      .sort((a, b) => userProfile.favoriteGenres[b] - userProfile.favoriteGenres[a])
      .slice(0, 5);
    
    const topTypes = Object.keys(userProfile.preferredTypes)
      .sort((a, b) => userProfile.preferredTypes[b] - userProfile.preferredTypes[a])
      .slice(0, 2);

    // Get anime IDs user has already seen
    const seenAnimeIds = user.watchlist.map(entry => entry.anime._id);

    try {
      // Try to get AI-powered recommendations first
      const aiRecommendations = await generateRecommendations(
        { 
          topGenres,
          preferredTypes: topTypes,
          avgRating: avgUserRating,
          completionRate: userProfile.completionRate 
        },
        user.watchlist
      );

      // Get full anime details for the AI recommendations
      const aiAnimeTitles = aiRecommendations.map(r => r.title);
      const aiAnime = await Anime.find({ 
        title: { $in: aiAnimeTitles },
        _id: { $nin: seenAnimeIds }
      }).select('title poster genres averageRating totalRatings type');

      // Map AI reasons to the anime
      const enhancedAiRecommendations = aiAnime.map(anime => {
        const aiRec = aiRecommendations.find(r => r.title === anime.title);
        return {
          ...anime.toObject(),
          reason: aiRec?.reason || 'Recommended based on your preferences',
          confidence: aiRec?.confidence || 0.8,
          source: 'ai'
        };
      });

      return res.json({ 
        recommendations: enhancedAiRecommendations,
        userProfile: {
          topGenres: topGenres.slice(0, 3),
          avgRating: Math.round(avgUserRating * 10) / 10,
          completionRate: Math.round(userProfile.completionRate * 100)
        },
        source: 'ai'
      });
    } catch (aiError) {
      console.error('AI recommendation failed, falling back to algorithm:', aiError);
      
      // Fallback to the existing algorithm if AI fails
      const candidates = await Anime.find({
        _id: { $nin: seenAnimeIds },
        averageRating: { $gte: Math.max(6, avgUserRating - 1) }
      }).select('title poster genres averageRating totalRatings type episodes');

      const scoredRecommendations = candidates.map(anime => {
        let score = 0;
        
        // Genre matching (40% weight)
        const genreMatches = anime.genres?.filter(g => topGenres.includes(g)).length || 0;
        score += (genreMatches / Math.max(topGenres.length, 1)) * 40;
        
        // Rating alignment (25% weight)
        const ratingDiff = Math.abs(anime.averageRating - avgUserRating);
        score += Math.max(0, (3 - ratingDiff) / 3) * 25;
        
        // Type preference (15% weight)
        if (topTypes.includes(anime.type)) score += 15;
        
        // Popularity factor (10% weight)
        const popularityScore = Math.min(anime.totalRatings / 1000, 1) * 10;
        score += popularityScore;
        
        // Diversity bonus (10% weight)
        const hasNewGenre = anime.genres?.some(g => !topGenres.includes(g));
        if (hasNewGenre && Math.random() > 0.7) score += 10;
        
        return { ...anime.toObject(), aiScore: score };
      });

      // Sort by AI score and get top recommendations
      const recommendations = scoredRecommendations
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 12);

      // Add recommendation reasons
      const reasonMap = {
        high_genre_match: 'Based on your favorite genres',
        rating_aligned: 'Matches your rating preferences', 
        type_preference: 'Similar to anime you enjoy',
        trending: 'Popular among similar users',
        discovery: 'Something new you might like'
      };

      const enhancedRecommendations = recommendations.map(rec => {
        let reason = 'Recommended for you';
        if (rec.aiScore > 60) reason = reasonMap.high_genre_match;
        else if (rec.aiScore > 45) reason = reasonMap.rating_aligned;
        else if (rec.aiScore > 30) reason = reasonMap.type_preference;
        else reason = reasonMap.discovery;
        
        return { 
          ...rec, 
          reason,
          source: 'algorithm',
          confidence: rec.aiScore / 100 // Convert to 0-1 scale
        };
      });

      res.json({ 
        recommendations: enhancedRecommendations,
        userProfile: {
          topGenres: topGenres.slice(0, 3),
          avgRating: Math.round(avgUserRating * 10) / 10,
          completionRate: Math.round(userProfile.completionRate * 100)
        },
        source: 'algorithm'
      });
    }
  } catch (error) {
    console.error('Error in recommendations:', error);
    res.status(500).json({ 
      message: 'Failed to generate recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



module.exports = router;
