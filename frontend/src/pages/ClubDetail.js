import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Tabs,
  Tab,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { clubService } from '../services/api';

const ClubDetailSkeleton = () => (
  <Container maxWidth="lg">
    <Skeleton variant="rectangular" height={200} sx={{ mb: 4 }} />
    <Skeleton variant="rectangular" height={48} sx={{ mb: 3 }} />
    <Skeleton variant="rectangular" height={300} />
  </Container>
);

const ClubDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clubRes, postsRes] = await Promise.all([
          clubService.getById(id),
          clubService.getPosts(id),
        ]);
        setClub(clubRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        setError('Failed to load club details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePostSubmit = async () => {
    try {
      const postData = { title: newPostTitle, content: newPostContent };
      const res = await clubService.createPost(id, postData);
      setPosts([res.data, ...posts]);
      setNewPostTitle('');
      setNewPostContent('');
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  const handleJoinLeave = async () => {
    try {
      const isMember = club.members.some(member => member._id === user._id);
      const action = isMember ? clubService.leave : clubService.join;
      const res = await action(id);
      setClub(res.data.club);
    } catch (err) {
      console.error('Failed to join/leave club', err);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  if (loading) return <ClubDetailSkeleton />;
  if (error) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!club) return null;

  const isMember = isAuthenticated && club.members.some(member => member._id === user._id);

  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Discussions
        return (
          <Box>
            {isMember && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Start a new discussion</Typography>
                <TextField fullWidth label="Title" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} sx={{ mb: 2 }} />
                <TextField fullWidth multiline rows={3} label="What's on your mind?" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" endIcon={<SendIcon />} disabled={!newPostTitle.trim() || !newPostContent.trim()} onClick={handlePostSubmit}>Post</Button>
                </Box>
              </Paper>
            )}
            {posts.map((post) => (
              <Paper key={post._id} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={post.author.avatar} alt={post.author.username} />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1">{post.author.username}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatDate(post.createdAt)}</Typography>
                  </Box>
                </Box>
                <Typography variant="h6" gutterBottom>{post.title}</Typography>
                <Typography variant="body1" paragraph>{post.content}</Typography>
                <Divider sx={{ my: 2 }} />
                <Button startIcon={<ThumbUpIcon />} size="small">Like ({post.likes.length})</Button>
              </Paper>
            ))}
          </Box>
        );
      case 1: // Members
        return (
          <List>
            {club.members.map((member) => (
              <ListItem key={member._id} divider>
                <ListItemAvatar><Avatar src={member.avatar} alt={member.username} /></ListItemAvatar>
                <ListItemText primary={member.username} secondary={club.admin === member._id ? 'Admin' : 'Member'} />
              </ListItem>
            ))}
          </List>
        );
      default: return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        sx={{ 
          p: 3, mb: 4, 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${club.avatar || 'https://via.placeholder.com/1200x300'})`,
          backgroundSize: 'cover', backgroundPosition: 'center', color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>{club.name}</Typography>
            <Typography variant="body1" sx={{ mb: 2, maxWidth: '80%' }}>{club.description}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {club.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Typography variant="body2">{club.memberCount} members</Typography>
              <Typography variant="body2">{club.postCount} posts</Typography>
            </Box>
          </Box>
          {isAuthenticated && (
            <Button 
              variant={isMember ? "outlined" : "contained"} 
              color={isMember ? "inherit" : "primary"}
              onClick={handleJoinLeave}
              sx={{ borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: isMember ? 'rgba(255, 255, 255, 0.1)' : '' } }}
            >
              {isMember ? 'Leave Club' : 'Join Club'}
            </Button>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="club tabs">
            <Tab label="Discussions" />
            <Tab label="Members" />
          </Tabs>
        </Box>
        <Box sx={{ py: 3 }}>{renderTabContent()}</Box>
      </Box>
    </Container>
  );
};

export default ClubDetail;