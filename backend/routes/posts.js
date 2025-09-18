const express = require('express');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      author: post.author.username,
      avatar: post.author.username.charAt(0).toUpperCase(),
      content: post.content,
      time: getTimeAgo(post.createdAt),
      likes: post.likes.length,
      comments: post.comments.length,
      type: 'User Post',
      color: 'info',
      userLiked: false,
      postComments: post.comments.map(comment => ({
        id: comment._id,
        author: comment.user.username,
        text: comment.text,
        time: getTimeAgo(comment.createdAt)
      }))
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = new Post({
      author: req.user.userId,
      content: content.trim()
    });

    await post.save();
    await post.populate('author', 'username avatar');

    const formattedPost = {
      id: post._id,
      author: post.author.username,
      avatar: post.author.username.charAt(0).toUpperCase(),
      content: post.content,
      time: 'Just now',
      likes: 0,
      comments: 0,
      type: 'User Post',
      color: 'info',
      userLiked: false,
      postComments: []
    };

    res.status(201).json(formattedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(like => like.user.toString() === req.user.userId);
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: req.user.userId });
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: likeIndex === -1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user.userId,
      text: text.trim()
    });

    await post.save();
    await post.populate('comments.user', 'username avatar');

    const newComment = post.comments[post.comments.length - 1];
    const formattedComment = {
      id: newComment._id,
      author: newComment.user.username,
      text: newComment.text,
      time: 'Just now'
    };

    res.status(201).json({
      comment: formattedComment,
      totalComments: post.comments.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${diffInDays}d ago`;
}

module.exports = router;