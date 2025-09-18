import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardMedia,
  Paper,
  TextField,
  Avatar,
  Divider,
  Chip,
  InputAdornment,
  IconButton,
  Badge
} from '@mui/material';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Visibility,
  ThumbUp,
  Comment,
  Announcement,
  Update,
  Group,
  PlayArrow
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { animeService, postService } from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLikes, setActivityLikes] = useState(() => {
    if (!user) return {};
    const saved = localStorage.getItem(`animeTracker_likes_${user.username}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState(() => {
    if (!user) return {};
    const saved = localStorage.getItem(`animeTracker_comments_${user.username}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [newComment, setNewComment] = useState({});
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`animeTracker_notifications_${user.username}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [postsLoading, setPostsLoading] = useState(true);

  // Enhanced activity feed with real anime content
  const activityFeed = [
    {
      id: 1,
      type: 'Site News',
      author: 'AnimeTracker',
      avatar: 'AT',
      title: '🎉 New AI-Powered Recommendations!',
      content: 'Our new AI recommendation engine is now live! Get personalized anime suggestions based on your viewing history, ratings, and preferences. The AI analyzes your taste to find hidden gems you\'ll love.',
      time: '2 hours ago',
      likes: 342,
      comments: 67,
      color: 'primary'
    },
    {
      id: 2,
      type: 'Database Update',
      author: 'AnimeTracker',
      avatar: 'AT',
      title: '📚 Winter 2024 Anime Added!',
      content: 'Added all Winter 2024 anime including Solo Leveling, Mashle Season 2, and more! Our database now contains over 15,000 anime titles with detailed information, ratings, and reviews.',
      time: '1 day ago',
      likes: 189,
      comments: 34,
      color: 'success'
    },
    {
      id: 3,
      type: 'Community',
      author: 'AnimeTracker',
      avatar: 'AT',
      title: '🏛️ Anime Clubs Now Live!',
      content: 'Join anime clubs, participate in discussions, and connect with fellow fans! Create your own club or join existing ones like "Shonen Enthusiasts" or "Studio Ghibli Fans".',
      time: '3 days ago',
      likes: 256,
      comments: 89,
      color: 'secondary'
    }
  ];

  // Real trending anime data
  const realTrendingAnime = [
    { 
      title: 'Solo Leveling', 
      type: 'TV', 
      status: 'Currently Airing', 
      count: 2847,
      rating: 9.2,
      poster: 'https://cdn.myanimelist.net/images/anime/1906/138982.jpg'
    },
    { 
      title: 'Frieren: Beyond Journey\'s End', 
      type: 'TV', 
      status: 'Finished', 
      count: 2156,
      rating: 9.4,
      poster: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg'
    },
    { 
      title: 'Jujutsu Kaisen', 
      type: 'TV', 
      status: 'Finished', 
      count: 1923,
      rating: 8.7,
      poster: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg'
    },
    { 
      title: 'Demon Slayer', 
      type: 'TV', 
      status: 'Finished', 
      count: 1756,
      rating: 8.9,
      poster: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg'
    }
  ];

  const recentReviews = [
    { 
      title: 'Frieren: Beyond Journey\'s End', 
      author: 'AnimeExpert2024', 
      rating: 10, 
      excerpt: 'A masterpiece that redefines what fantasy anime can be. The character development and emotional depth are unparalleled...',
      avatar: 'AE'
    },
    { 
      title: 'Solo Leveling', 
      author: 'ManhwaReader', 
      rating: 9, 
      excerpt: 'Incredible adaptation of the webtoon. The animation quality and fight scenes are absolutely stunning...',
      avatar: 'MR'
    },
    { 
      title: 'Chainsaw Man', 
      author: 'CriticalOtaku', 
      rating: 9, 
      excerpt: 'Dark, brutal, and beautifully animated. MAPPA outdid themselves with this adaptation...',
      avatar: 'CO'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [animeResponse, postsResponse] = await Promise.all([
          animeService.getAll({ limit: 4 }),
          postService.getAll()
        ]);
        
        const animeData = animeResponse.data?.anime || animeResponse.data || [];
        if (animeData.length > 0) {
          setTrendingAnime(animeData.slice(0, 4));
        } else {
          setTrendingAnime(realTrendingAnime);
        }
        
        setPosts(postsResponse.data || []);
      } catch (error) {
        setTrendingAnime(realTrendingAnime);
        setPosts([]);
      } finally {
        setLoading(false);
        setPostsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
      const savedLikes = localStorage.getItem(`animeTracker_likes_${user.username}`);
      const savedComments = localStorage.getItem(`animeTracker_comments_${user.username}`);
      const savedNotifications = localStorage.getItem(`animeTracker_notifications_${user.username}`);
      
      if (savedLikes) setActivityLikes(JSON.parse(savedLikes));
      if (savedComments) setComments(JSON.parse(savedComments));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } else {
      setActivityLikes({});
      setComments({});
      setNotifications([]);
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/anime?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLike = (activityId, authorName) => {
    const isLiking = !activityLikes[activityId];
    const newLikes = {
      ...activityLikes,
      [activityId]: isLiking
    };
    setActivityLikes(newLikes);
    if (user) localStorage.setItem(`animeTracker_likes_${user.username}`, JSON.stringify(newLikes));
    
    if (isLiking && user) {
      const newNotifications = [{
        id: Date.now(),
        type: 'like',
        message: `${user.username} liked ${authorName}'s post`,
        time: 'Just now'
      }, ...notifications];
      setNotifications(newNotifications);
      localStorage.setItem(`animeTracker_notifications_${user.username}`, JSON.stringify(newNotifications));
    }
  };

  const handlePostUpdate = async () => {
    if (statusText.trim() && user) {
      try {
        const response = await postService.create({ content: statusText });
        setPosts(prev => [response.data, ...prev]);
        setStatusText('');
        
        const newNotifications = [{
          id: Date.now(),
          type: 'post',
          message: `You posted: "${statusText.substring(0, 50)}${statusText.length > 50 ? '...' : ''}"`,
          time: 'Just now'
        }, ...notifications];
        setNotifications(newNotifications);
        localStorage.setItem(`animeTracker_notifications_${user.username}`, JSON.stringify(newNotifications));
      } catch (error) {
        console.error('Failed to create post:', error);
      }
    }
  };

  const toggleComments = (activityId) => {
    setShowComments(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }));
  };

  const handleAddComment = (activityId, authorName) => {
    const commentText = newComment[activityId];
    if (commentText?.trim() && user) {
      const newComments = {
        ...comments,
        [activityId]: [
          ...(comments[activityId] || []),
          {
            id: Date.now(),
            text: commentText,
            author: user.username,
            time: 'Just now'
          }
        ]
      };
      setComments(newComments);
      localStorage.setItem(`animeTracker_comments_${user.username}`, JSON.stringify(newComments));
      setNewComment(prev => ({ ...prev, [activityId]: '' }));
      
      const newNotifications = [{
        id: Date.now(),
        type: 'comment',
        message: `${user.username} commented on ${authorName}'s post`,
        time: 'Just now'
      }, ...notifications];
      setNotifications(newNotifications);
      localStorage.setItem(`animeTracker_notifications_${user.username}`, JSON.stringify(newNotifications));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Hero Search Section */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, rgba(124, 77, 255, 0.1) 0%, rgba(255, 64, 129, 0.1) 100%)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          🎌 Welcome to AnimeTracker
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Track your favorite anime, discover new series, and connect with fellow fans
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search for anime, manga, or characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button type="submit" variant="contained" sx={{ mr: -1 }}>
                    Search
                  </Button>
                </InputAdornment>
              )
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper'
              }
            }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Activity Feed */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Announcement color="primary" />
            <Typography variant="h5" fontWeight="bold">
              Activity Feed
            </Typography>
          </Box>
          
          {/* Status Update */}
          {user && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <TextField
                  fullWidth
                  placeholder="Share your thoughts about anime..."
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="contained" 
                  disabled={!statusText.trim()}
                  startIcon={<Comment />}
                  onClick={handlePostUpdate}
                >
                  Post Update
                </Button>
              </Box>
            </Paper>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                🔔 Recent Activity
              </Typography>
              {notifications.slice(0, 3).map((notif) => (
                <Typography key={notif.id} variant="body2" sx={{ mb: 0.5 }}>
                  {notif.message} • {notif.time}
                </Typography>
              ))}
            </Paper>
          )}

          {/* Activity Feed */}
          {postsLoading ? (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography>Loading posts...</Typography>
            </Paper>
          ) : (
            [...posts, ...activityFeed].map((activity) => (
            <Paper key={activity.id} sx={{ p: 3, mb: 3, position: 'relative' }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: `${activity.color}.main` }}>
                  {activity.avatar}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {activity.author}
                  </Typography>
                  <Chip 
                    label={activity.type} 
                    size="small" 
                    color={activity.color}
                    icon={activity.type === 'Site News' ? <Update /> : <Group />}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {activity.title}
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
                {activity.content}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Button 
                  size="small" 
                  startIcon={<ThumbUp />}
                  onClick={() => handleLike(activity.id, activity.author)}
                  sx={{ 
                    color: activityLikes[activity.id] ? 'primary.main' : 'text.secondary',
                    '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                  }}
                >
                  {activity.likes + (activityLikes[activity.id] ? 1 : 0)}
                </Button>
                <Button 
                  size="small" 
                  startIcon={<Comment />}
                  onClick={() => toggleComments(activity.id)}
                  sx={{ 
                    color: showComments[activity.id] ? 'primary.main' : 'text.secondary',
                    '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                  }}
                >
                  {activity.comments + (comments[activity.id]?.length || 0)}
                </Button>
              </Box>
              
              {/* Comments Section */}
              {showComments[activity.id] && (
                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  {/* Existing Comments */}
                  {comments[activity.id]?.map((comment) => (
                    <Box key={comment.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                        {comment.author.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {comment.time}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {comment.text}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  
                  {/* Add Comment */}
                  {user && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {user.username?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Write a comment..."
                          value={newComment[activity.id] || ''}
                          onChange={(e) => setNewComment(prev => ({
                            ...prev,
                            [activity.id]: e.target.value
                          }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(activity.id, activity.author);
                            }
                          }}
                        />
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleAddComment(activity.id, activity.author)}
                          disabled={!newComment[activity.id]?.trim()}
                        >
                          Post
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          ))
          )}
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="outlined" size="large">
              Load More Activity
            </Button>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Trending */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUp color="error" />
              <Typography variant="h6" fontWeight="bold">
                Trending Now
              </Typography>
            </Box>
            
            {trendingAnime.map((anime, index) => (
              <Card key={index} sx={{ mb: 2, display: 'flex', height: 100, width: '100%' }}>
                <CardMedia
                  component="img"
                  sx={{ width: 70, height: 100, objectFit: 'cover' }}
                  image={anime.poster || 'https://via.placeholder.com/70x100/7c4dff/ffffff?text=Anime'}
                  alt={anime.title}
                />
                <CardContent sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {anime.count || Math.floor(Math.random() * 3000) + 500} watching
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                    {anime.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {anime.type} · {anime.status || 'Finished'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ fontSize: 12, color: 'warning.main' }} />
                      <Typography variant="caption">
                        {anime.averageRating || anime.rating || '8.5'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            <Button 
              fullWidth 
              variant="outlined" 
              component={RouterLink} 
              to="/seasonal"
              sx={{ mt: 1 }}
            >
              View All Trending
            </Button>
          </Paper>

          {/* Recent Reviews */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Star color="warning" />
              <Typography variant="h6" fontWeight="bold">
                Recent Reviews
              </Typography>
            </Box>
            
            {recentReviews.map((review, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {review.avatar}
                  </Avatar>
                  <Typography variant="body2" fontWeight="bold">
                    {review.author}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} sx={{ fontSize: 12, color: 'warning.main' }} />
                    ))}
                  </Box>
                </Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary">
                  {review.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {review.excerpt}
                </Typography>
                {index < recentReviews.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/anime"
                startIcon={<PlayArrow />}
                fullWidth
              >
                Browse Anime
              </Button>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/recommendations"
                startIcon={<TrendingUp />}
                fullWidth
              >
                AI Recommendations
              </Button>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/clubs"
                startIcon={<Group />}
                fullWidth
              >
                Join Communities
              </Button>
              {user && (
                <Button 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/watchlist"
                  startIcon={<Visibility />}
                  fullWidth
                >
                  My Watchlist
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;