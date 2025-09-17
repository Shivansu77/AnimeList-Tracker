const express = require('express');
const Discussion = require('../models/Discussion');
const Post = require('../models/Post');
const Club = require('../models/Club');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get discussions for a club
router.get('/club/:clubId', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = { club: req.params.clubId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const discussions = await Discussion.find(query)
      .populate('author', 'username avatar')
      .populate('anime', 'title poster')
      .sort({ isPinned: -1, lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Discussion.countDocuments(query);

    res.json({
      discussions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single discussion with posts
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('anime', 'title poster')
      .populate('club', 'name');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Increment view count
    discussion.views += 1;
    await discussion.save();

    const posts = await Post.find({ discussion: req.params.id, isDeleted: false })
      .populate('author', 'username avatar')
      .populate('replies')
      .sort({ createdAt: 1 });

    res.json({
      discussion,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new discussion
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      content,
      club,
      anime,
      category,
      tags,
      hasSpoilers,
      spoilerEpisode
    } = req.body;

    // Check if user is member of the club
    const clubDoc = await Club.findById(club);
    if (!clubDoc) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const isMember = clubDoc.members.some(
      member => member.user.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member of this club' });
    }

    const discussion = new Discussion({
      title,
      content,
      author: req.user.userId,
      club,
      anime,
      category,
      tags,
      hasSpoilers,
      spoilerEpisode
    });

    await discussion.save();

    // Update club stats
    clubDoc.stats.totalDiscussions += 1;
    await clubDoc.save();

    await discussion.populate('author', 'username avatar');
    await discussion.populate('anime', 'title poster');

    res.status(201).json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update discussion
router.put('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is author or moderator
    if (discussion.author.toString() !== req.user.userId) {
      const club = await Club.findById(discussion.club);
      const isModerator = club.moderators.includes(req.user.userId) || 
                         club.creator.toString() === req.user.userId;
      
      if (!isModerator) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    const { title, content, category, tags, hasSpoilers, spoilerEpisode } = req.body;

    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (category) discussion.category = category;
    if (tags) discussion.tags = tags;
    if (hasSpoilers !== undefined) discussion.hasSpoilers = hasSpoilers;
    if (spoilerEpisode) discussion.spoilerEpisode = spoilerEpisode;

    await discussion.save();

    res.json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete discussion
router.delete('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is author or moderator
    if (discussion.author.toString() !== req.user.userId) {
      const club = await Club.findById(discussion.club);
      const isModerator = club.moderators.includes(req.user.userId) || 
                         club.creator.toString() === req.user.userId;
      
      if (!isModerator) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await Discussion.findByIdAndDelete(req.params.id);
    await Post.deleteMany({ discussion: req.params.id });

    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike discussion
router.post('/:id/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const existingLike = discussion.likes.find(
      like => like.user.toString() === req.user.userId
    );

    if (existingLike) {
      // Unlike
      discussion.likes = discussion.likes.filter(
        like => like.user.toString() !== req.user.userId
      );
    } else {
      // Like
      discussion.likes.push({ user: req.user.userId });
    }

    await discussion.save();

    res.json({ 
      message: existingLike ? 'Discussion unliked' : 'Discussion liked',
      likesCount: discussion.likes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pin/Unpin discussion (moderators only)
router.post('/:id/pin', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const club = await Club.findById(discussion.club);
    const isModerator = club.moderators.includes(req.user.userId) || 
                       club.creator.toString() === req.user.userId;
    
    if (!isModerator) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({ 
      message: discussion.isPinned ? 'Discussion pinned' : 'Discussion unpinned',
      isPinned: discussion.isPinned
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
