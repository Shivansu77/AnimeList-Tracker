const express = require('express');
const Review = require('../models/Review');
const Anime = require('../models/Anime');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create a review
router.post('/', auth, async (req, res) => {
  try {
    const {
      anime,
      rating,
      title,
      content,
      spoilerWarning = false,
      categories,
      isRecommended = true
    } = req.body;

    // Check if anime exists
    const animeDoc = await Anime.findById(anime);
    if (!animeDoc) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    // Check if user already reviewed this anime
    const existingReview = await Review.findOne({
      user: req.user.userId,
      anime: anime
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this anime' });
    }

    const review = new Review({
      user: req.user.userId,
      anime,
      rating,
      title,
      content,
      spoilerWarning,
      categories,
      isRecommended
    });

    await review.save();

    // Update anime's average rating and total ratings
    const allReviews = await Review.find({ anime });
    const totalRatings = allReviews.length;
    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;

    await Anime.findByIdAndUpdate(anime, {
      averageRating: Math.round(averageRating * 100) / 100,
      totalRatings,
      $push: { reviews: review._id }
    });

    await review.populate('user', 'username avatar');

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for an anime
router.get('/anime/:animeId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'rating-high':
        sortOption = { rating: -1 };
        break;
      case 'rating-low':
        sortOption = { rating: 1 };
        break;
      case 'helpful':
        sortOption = { helpfulCount: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const reviews = await Review.find({ anime: req.params.animeId })
      .populate('user', 'username avatar')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ anime: req.params.animeId });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('anime', 'title poster')
      .populate('comments.user', 'username avatar');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const {
      rating,
      title,
      content,
      spoilerWarning,
      categories,
      isRecommended
    } = req.body;

    const oldRating = review.rating;

    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (content !== undefined) review.content = content;
    if (spoilerWarning !== undefined) review.spoilerWarning = spoilerWarning;
    if (categories !== undefined) review.categories = categories;
    if (isRecommended !== undefined) review.isRecommended = isRecommended;

    await review.save();

    // Update anime's average rating if rating changed
    if (rating !== undefined && rating !== oldRating) {
      const allReviews = await Review.find({ anime: review.anime });
      const totalRatings = allReviews.length;
      const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;

      await Anime.findByIdAndUpdate(review.anime, {
        averageRating: Math.round(averageRating * 100) / 100
      });
    }

    await review.populate('user', 'username avatar');

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const animeId = review.anime;

    await Review.findByIdAndDelete(req.params.id);

    // Update anime's average rating and total ratings
    const remainingReviews = await Review.find({ anime: animeId });
    const totalRatings = remainingReviews.length;
    
    let averageRating = 0;
    if (totalRatings > 0) {
      averageRating = remainingReviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;
      averageRating = Math.round(averageRating * 100) / 100;
    }

    await Anime.findByIdAndUpdate(animeId, {
      averageRating,
      totalRatings,
      $pull: { reviews: req.params.id }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike review
router.post('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user.userId;
    const hasLiked = review.likes.includes(userId);
    const hasDisliked = review.dislikes.includes(userId);

    if (hasLiked) {
      // Remove like
      review.likes = review.likes.filter(id => id.toString() !== userId);
    } else {
      // Add like and remove dislike if exists
      review.likes.push(userId);
      if (hasDisliked) {
        review.dislikes = review.dislikes.filter(id => id.toString() !== userId);
      }
    }

    // Update helpful count
    review.helpfulCount = review.likes.length - review.dislikes.length;

    await review.save();

    res.json({
      message: hasLiked ? 'Like removed' : 'Review liked',
      likes: review.likes.length,
      dislikes: review.dislikes.length,
      helpfulCount: review.helpfulCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dislike/undislike review
router.post('/:id/dislike', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user.userId;
    const hasLiked = review.likes.includes(userId);
    const hasDisliked = review.dislikes.includes(userId);

    if (hasDisliked) {
      // Remove dislike
      review.dislikes = review.dislikes.filter(id => id.toString() !== userId);
    } else {
      // Add dislike and remove like if exists
      review.dislikes.push(userId);
      if (hasLiked) {
        review.likes = review.likes.filter(id => id.toString() !== userId);
      }
    }

    // Update helpful count
    review.helpfulCount = review.likes.length - review.dislikes.length;

    await review.save();

    res.json({
      message: hasDisliked ? 'Dislike removed' : 'Review disliked',
      likes: review.likes.length,
      dislikes: review.dislikes.length,
      helpfulCount: review.helpfulCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to review
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const comment = {
      user: req.user.userId,
      content,
      createdAt: new Date()
    };

    review.comments.push(comment);
    await review.save();

    await review.populate('comments.user', 'username avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: review.comments[review.comments.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reviews
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ user: req.params.userId })
      .populate('anime', 'title poster')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ user: req.params.userId });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
