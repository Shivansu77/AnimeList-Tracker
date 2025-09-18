import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  Collapse,
  Divider,
  Chip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ActivityFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postService.getAll();
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await postService.create({ content: newPost });
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await postService.like(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: response.data.likes, userLiked: response.data.liked }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (postId) => {
    const commentText = commentTexts[postId];
    if (!commentText?.trim()) return;

    try {
      const response = await postService.addComment(postId, { text: commentText });
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments: response.data.totalComments,
              postComments: [...(post.postComments || []), response.data.comment]
            }
          : post
      ));
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) return <Typography>Loading activity feed...</Typography>;

  return (
    <Box>
      {/* Create Post */}
      {user && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box component="form" onSubmit={handleCreatePost}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Share your thoughts about anime..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!newPost.trim()}
            >
              Post
            </Button>
          </Box>
        </Paper>
      )}

      {/* Posts Feed */}
      {posts.map((post) => (
        <Paper key={post.id} sx={{ p: 3, mb: 2 }}>
          {/* Post Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 2 }}>{post.avatar}</Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {post.author}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {post.time}
              </Typography>
            </Box>
            <Chip label={post.type} color={post.color} size="small" />
          </Box>

          {/* Post Content */}
          <Typography variant="body1" sx={{ mb: 2 }}>
            {post.content}
          </Typography>

          {/* Post Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => handleLike(post.id)}
              color={post.userLiked ? 'error' : 'default'}
            >
              {post.userLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2">{post.likes}</Typography>

            <IconButton onClick={() => toggleComments(post.id)}>
              <ChatBubbleOutlineIcon />
            </IconButton>
            <Typography variant="body2">{post.comments}</Typography>
          </Box>

          {/* Comments Section */}
          <Collapse in={expandedComments[post.id]}>
            <Divider sx={{ my: 2 }} />
            
            {/* Existing Comments */}
            {post.postComments?.map((comment) => (
              <Box key={comment.id} sx={{ display: 'flex', mb: 2 }}>
                <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
                  {comment.author.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Paper sx={{ p: 1.5, bgcolor: 'grey.100' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {comment.author}
                    </Typography>
                    <Typography variant="body2">{comment.text}</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {comment.time}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Add Comment */}
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a comment..."
                  value={commentTexts[post.id] || ''}
                  onChange={(e) => setCommentTexts(prev => ({
                    ...prev,
                    [post.id]: e.target.value
                  }))}
                  sx={{ mr: 1 }}
                />
                <IconButton
                  onClick={() => handleAddComment(post.id)}
                  disabled={!commentTexts[post.id]?.trim()}
                  color="primary"
                >
                  <SendIcon />
                </IconButton>
              </Box>
            )}
          </Collapse>
        </Paper>
      ))}

      {posts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No activity yet. Be the first to share something!
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ActivityFeed;