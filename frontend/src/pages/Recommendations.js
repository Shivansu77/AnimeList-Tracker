import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  Paper,
  Skeleton,
  Chip,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  Psychology, 
  Star, 
  TrendingUp, 
  Refresh,
  SmartToy
} from '@mui/icons-material';
import { animeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RecommendationCard = ({ anime }) => {
  return (
    <Card 
      sx={{ 
        height: 420,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(124, 77, 255, 0.3)'
        }
      }}
    >
      {/* AI Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 2,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          px: 1,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <SmartToy sx={{ fontSize: 14 }} />
        <Typography variant="caption" fontWeight="bold">
          AI
        </Typography>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="260"
          image={anime.poster || 'https://via.placeholder.com/200x260/7c4dff/ffffff?text=AI+Pick'}
          alt={anime.title}
        />
        
        {anime.averageRating && (
          <Chip
            icon={<Star sx={{ fontSize: 14 }} />}
            label={anime.averageRating.toFixed(1)}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'warning.main',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        )}
      </Box>

      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="subtitle1" 
          component={RouterLink}
          to={`/anime/${anime._id}`}
          sx={{
            fontWeight: 600,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            minHeight: 48,
            '&:hover': { color: 'primary.main' }
          }}
        >
          {anime.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {anime.genres?.slice(0, 2).map(genre => (
            <Chip 
              key={genre} 
              label={genre} 
              size="small" 
              sx={{ 
                fontSize: '0.75rem',
                bgcolor: 'rgba(124, 77, 255, 0.1)',
                color: 'primary.main',
                border: '1px solid rgba(124, 77, 255, 0.3)'
              }}
            />
          ))}
        </Box>

        {/* AI Reason */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
          🤖 {anime.reason}
        </Typography>

        {/* AI Score Bar */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            AI Match: {Math.round(anime.aiScore || 75)}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={anime.aiScore || 75} 
            sx={{ 
              height: 4, 
              borderRadius: 2,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'primary.main'
              }
            }} 
          />
        </Box>

        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {anime.type} • {anime.episodes} eps
          </Typography>
          <Button 
            variant="contained" 
            size="small"
            component={RouterLink}
            to={`/anime/${anime._id}`}
          >
            View
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const Recommendations = () => {
  const { user, isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await animeService.getRecommendations();
      console.log('Recommendations response:', response.data);
      
      // Handle different response formats
      if (response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        setUserProfile(response.data.userProfile);
      } else if (Array.isArray(response.data)) {
        // Fallback for simple array response
        setRecommendations(response.data);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Recommendations error:', err);
      
      // Try fallback with popular anime
      try {
        const fallbackResponse = await animeService.getAll({ limit: 8 });
        const fallbackAnime = fallbackResponse.data?.anime || fallbackResponse.data || [];
        
        if (fallbackAnime.length > 0) {
          setRecommendations(fallbackAnime.map(anime => ({
            ...anime,
            reason: 'Popular anime (fallback)',
            aiScore: 70
          })));
          setError('Showing popular anime. Add anime to your watchlist for personalized recommendations.');
        } else {
          setError('No anime available. Please add some anime to the database.');
        }
      } catch (fallbackErr) {
        console.error('Fallback failed:', fallbackErr);
        setError('Unable to load recommendations. Please check if the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Psychology sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            AI-Powered Recommendations
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to get personalized anime recommendations powered by artificial intelligence
          </Typography>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/login"
            size="large"
          >
            Sign In to Get Recommendations
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology color="primary" />
              AI Recommendations
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Personalized picks based on your viewing history and preferences
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={fetchRecommendations}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* User Profile Insights */}
        {userProfile && (
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, rgba(124, 77, 255, 0.1) 0%, rgba(255, 64, 129, 0.1) 100%)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="primary" />
              Your Anime Profile
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Favorite Genres
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {userProfile.topGenres?.map(genre => (
                    <Chip key={genre} label={genre} color="primary" size="small" />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Average Rating
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {userProfile.avgRating}/10 ⭐
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Completion Rate
                </Typography>
                <Typography variant="h6" color="success.main">
                  {userProfile.completionRate}% 📊
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Recommendations Grid */}
      <Grid container spacing={3}>
        {loading ? (
          Array.from(new Array(8)).map((_, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ height: 420 }}>
                <Skeleton variant="rectangular" height={260} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : recommendations.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recommendations available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add some anime to your watchlist to get AI-powered recommendations!
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/anime"
              >
                Browse Anime
              </Button>
            </Paper>
          </Grid>
        ) : (
          recommendations.map((anime) => (
            <Grid item xs={6} sm={4} md={3} key={anime._id}>
              <RecommendationCard anime={anime} />
            </Grid>
          ))
        )}
      </Grid>

      {/* AI Info */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy color="primary" />
          How Our AI Works
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Our recommendation engine analyzes your viewing history, ratings, genre preferences, and completion patterns 
          to suggest anime you'll love. The AI considers factors like genre matching (40%), rating alignment (25%), 
          type preferences (15%), popularity (10%), and diversity (10%) to create personalized recommendations.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Recommendations;