import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Paper,
  TextField,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Mock activity data
const activityFeed = [
  {
    id: 1,
    type: 'Site News',
    author: 'AnimeTracker',
    title: 'Site Updates & New Features',
    content: 'We\'ve added new features including club discussions, improved watchlist management, and better anime recommendations. Thank you to all our users for the feedback!',
    time: '2 hours ago',
    likes: 156,
    comments: 23
  },
  {
    id: 2,
    type: 'Site News',
    author: 'AnimeTracker',
    title: 'Database Updates',
    content: 'Added over 500 new anime titles to our database. We\'re constantly working to keep our collection up to date with the latest releases.',
    time: '1 day ago',
    likes: 89,
    comments: 12
  },
  {
    id: 3,
    type: 'Site News',
    author: 'AnimeTracker',
    title: 'Community Guidelines Update',
    content: 'Please review our updated community guidelines. We want to maintain a positive environment for all anime fans.',
    time: '3 days ago',
    likes: 67,
    comments: 8
  }
];

const trendingAnime = [
  { title: 'Chainsaw Man', type: 'Manga', status: 'Releasing', count: 126 },
  { title: 'Jujutsu Kaisen', type: 'TV', status: 'Finished', count: 124 },
  { title: 'Attack on Titan', type: 'TV', status: 'Finished', count: 120 },
  { title: 'Demon Slayer', type: 'TV', status: 'Releasing', count: 111 }
];

const recentReviews = [
  { title: 'One Piece', author: 'AnimeReviewer', rating: 9, excerpt: 'An epic adventure that never gets old...' },
  { title: 'Naruto', author: 'MangaFan', rating: 8, excerpt: 'Great character development and world building...' },
  { title: 'Death Note', author: 'CriticalViewer', rating: 10, excerpt: 'A psychological masterpiece that keeps you guessing...' }
];

const Home = () => {
  const { user } = useAuth();
  const [statusText, setStatusText] = useState('');

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Grid container spacing={3}>
        {/* Main Activity Feed */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            Activity
          </Typography>
          
          {/* Status Update */}
          {user && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <TextField
                  fullWidth
                  placeholder="Write a status..."
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  multiline
                  rows={2}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" disabled={!statusText.trim()}>
                  Post
                </Button>
              </Box>
            </Paper>
          )}

          {/* Activity Feed */}
          {activityFeed.map((activity) => (
            <Paper key={activity.id} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>AT</Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {activity.author}
                  </Typography>
                  <Chip label={activity.type} size="small" color="primary" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {activity.title}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {activity.content}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Button size="small">{activity.likes} ♥</Button>
                <Button size="small">{activity.comments} comments</Button>
              </Box>
            </Paper>
          ))}
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="outlined">Load More</Button>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Trending */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trending Anime & Manga
            </Typography>
            {trendingAnime.map((anime, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {anime.count} recently watched
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {anime.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {anime.type} · {anime.status}
                </Typography>
                {index < trendingAnime.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Paper>

          {/* Recent Reviews */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reviews
            </Typography>
            {recentReviews.map((review, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Review of {review.title} by {review.author}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {review.excerpt}
                </Typography>
                <Typography variant="body2" color="primary">
                  ★ {review.rating}
                </Typography>
                {index < recentReviews.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" component={RouterLink} to="/anime">
                Browse Anime
              </Button>
              <Button variant="outlined" component={RouterLink} to="/clubs">
                Join Clubs
              </Button>
              <Button variant="outlined" component={RouterLink} to="/watchlist">
                My Watchlist
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;