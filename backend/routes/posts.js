const express = require('express');
const Post = require('../models/Post');
const Discussion = require('../models/Discussion');
const Club = require('../models/Club');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create new post
router.post('/', auth, async (req, res) => {
  try {
    const {
      content,
      discussion,
      parentPost,
      hasSpoilers,
      spoilerEpisode
    } = req.body;

    // Check if discussion exists and user has access
    const discussionDoc = await Discussion.findById(discussion).populate('club');
    if (!discussionDoc) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is member of the club
    const isMember = discussionDoc.club.members.some(
      member => member.user.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member of this club' });
    }

    const post = new Post({
      content,
      author: req.user.userId,
      discussion,
      parentPost,
      hasSpoilers,
      spoilerEpisode
    });

    await post.save();

    // Update discussion stats
    discussionDoc.postCount += 1;
    discussionDoc.lastActivity = new Date();
    await discussionDoc.save();

    // Update club stats
    discussionDoc.club.stats.totalPosts += 1;
    await discussionDoc.club.save();

    // If this is a reply, add to parent post
    if (parentPost) {
      await Post.findByIdAndUpdate(parentPost, {
        $push: { replies: post._id }
      });
    }

    await post.populate('author', 'username avatar');

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is author
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { content, hasSpoilers, spoilerEpisode } = req.body;

    // Save edit history
    if (content !== post.content) {
      post.editHistory.push({
        content: post.content,
        editedAt: new Date()
      });
      post.isEdited = true;
    }

    post.content = content;
    if (hasSpoilers !== undefined) post.hasSpoilers = hasSpoilers;
    if (spoilerEpisode) post.spoilerEpisode = spoilerEpisode;

    await post.save();

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is author or moderator
    if (post.author.toString() !== req.user.userId) {
      const discussion = await Discussion.findById(post.discussion).populate('club');
      const isModerator = discussion.club.moderators.includes(req.user.userId) || 
                         discussion.club.creator.toString() === req.user.userId;
      
      if (!isModerator) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    // Soft delete
    post.isDeleted = true;
    post.deletedAt = new Date();
    post.deletedBy = req.user.userId;
    await post.save();

    // Update discussion post count
    await Discussion.findByIdAndUpdate(post.discussion, {
      $inc: { postCount: -1 }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = post.likes.find(
      like => like.user.toString() === req.user.userId
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user.userId
      );
    } else {
      // Like
      post.likes.push({ user: req.user.userId });
    }

    await post.save();

    res.json({ 
      message: existingLike ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get post replies
router.get('/:id/replies', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Validate and parse pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const replies = await Post.find({ 
      parentPost: req.params.id,
      isDeleted: false 
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Post.countDocuments({ 
      parentPost: req.params.id,
      isDeleted: false 
    });

    res.json({
      replies,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get post edit history (author only)
router.get('/:id/history', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is author
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(post.editHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
