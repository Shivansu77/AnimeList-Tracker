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
  // Calculate match percentage from confidence or aiScore
  const matchPercentage = anime.confidence 
    ? Math.round(anime.confidence * 100) 
    : anime.aiScore 
      ? Math.round(anime.aiScore) 
      : 75;

  // Determine match color based on percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'success.main';
    if (percentage >= 60) return 'primary.main';
    return 'warning.main';
  };

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
      {anime.source === 'ai' && (
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
      )}

      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="260"
          image={anime.poster || 'https://via.placeholder.com/200x260/7c4dff/ffffff?text=No+Image'}
          alt={anime.title}
          sx={{ objectFit: 'cover' }}
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
              fontWeight: 'bold',
              zIndex: 2
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
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic', minHeight: 40 }}>
          {anime.reason ? `🤖 ${anime.reason}` : 'Recommended based on your preferences'}
        </Typography>

        {/* Match Score Bar */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Match: {matchPercentage}%
            </Typography>
            {anime.source === 'ai' && (
              <Typography variant="caption" color={getMatchColor(matchPercentage)}>
                {matchPercentage >= 80 ? 'Excellent' : matchPercentage >= 60 ? 'Good' : 'Fair'} Match
              </Typography>
            )}
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={matchPercentage} 
            sx={{ 
              height: 4, 
              borderRadius: 2,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: getMatchColor(matchPercentage)
              }
            }} 
          />
        </Box>

        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {anime.type} • {anime.episodes || '?'} eps
          </Typography>
          <Button 
            variant="contained" 
            size="small"
            component={RouterLink}
            to={`/anime/${anime._id}`}
            sx={{ 
              bgcolor: getMatchColor(matchPercentage),
              '&:hover': { bgcolor: getMatchColor(matchPercentage), opacity: 0.9 }
            }}
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
  const [source, setSource] = useState('ai'); // 'ai' or 'algorithm' or 'popular'

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await animeService.getRecommendations();
      console.log('Recommendations response:', response.data);
      
      if (response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        setUserProfile(response.data.userProfile);
        setSource(response.data.source || 'algorithm');
      } else if (Array.isArray(response.data)) {
        // Fallback for simple array response
        setRecommendations(response.data.map(item => ({
          ...item,
          reason: 'Recommended based on your preferences',
          source: 'algorithm'
        })));
        setSource('algorithm');
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
            confidence: 0.7,
            source: 'popular'
          })));
          setSource('popular');
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
              {source === 'ai' ? 'AI-Powered' : source === 'algorithm' ? 'Personalized' : 'Popular'} Recommendations
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {source === 'ai' 
                ? 'Smart recommendations powered by Gemini AI' 
                : source === 'algorithm' 
                  ? 'Recommendations based on your viewing patterns' 
                  : 'Popular anime you might enjoy'}
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

      {error && <Alert severity={source === 'popular' ? 'info' : 'error'} sx={{ mb: 3 }}>{error}</Alert>}

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
      {source === 'ai' && (
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy color="primary" />
            How Our AI Works
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Our AI analyzes your watch history, ratings, and preferences to suggest anime you'll love. 
            It considers factors like genre preferences, rating patterns, and completion rates to 
            provide personalized recommendations just for you.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Match Score:</strong> This shows how well each recommendation aligns with your 
            preferences. Higher scores indicate better matches based on your viewing history.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Recommendations;