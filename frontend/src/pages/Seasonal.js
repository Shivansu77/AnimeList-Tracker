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
  IconButton,
  Chip
} from '@mui/material';
import { Delete, Star } from '@mui/icons-material';
import { animeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AnimeCard = ({ anime, onDelete, showDelete }) => {
  return (
    <Card 
      sx={{ 
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="240"
          image={anime.poster || 'https://via.placeholder.com/200x240/f5f5f5/999?text=No+Image'}
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
              left: 8,
              bgcolor: 'warning.main',
              color: 'white'
            }}
          />
        )}

        {showDelete && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(anime._id, anime.title);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
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
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>

        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {anime.type} • {anime.episodes} eps
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : 'N/A'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const AnimeSection = ({ title, animeList, loading, onDelete }) => {
  const { user } = useAuth();

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        {title}
      </Typography>
      
      <Grid container spacing={3}>
        {loading ? (
          Array.from(new Array(5)).map((_, index) => (
            <Grid item xs={6} sm={4} md={2.4} key={index}>
              <Card sx={{ height: 400 }}>
                <Skeleton variant="rectangular" height={240} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : animeList.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No anime found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add some anime to see them here!
              </Typography>
            </Paper>
          </Grid>
        ) : (
          animeList.map((anime) => (
            <Grid item xs={6} sm={4} md={2.4} key={anime._id}>
              <AnimeCard 
                anime={anime}
                onDelete={onDelete}
                showDelete={user?.isAdmin}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

const Seasonal = () => {
  const [animeData, setAnimeData] = useState({
    popular: [],
    upcoming: [],
    allTime: []
  });
  const [loading, setLoading] = useState(true);

  const handleDeleteAnime = async (animeId, animeTitle) => {
    if (window.confirm(`Are you sure you want to delete "${animeTitle}"?`)) {
      try {
        await animeService.delete(animeId);
        fetchAnimeData();
      } catch (error) {
        console.error('Failed to delete anime:', error);
        alert('Failed to delete anime');
      }
    }
  };

  const fetchAnimeData = async () => {
    try {
      setLoading(true);
      const animeResponse = await animeService.getAll({ limit: 30 });
      
      const allAnime = animeResponse.data?.anime || animeResponse.data || [];
      
      if (allAnime.length === 0) {
        setAnimeData({
          popular: [],
          upcoming: [],
          allTime: []
        });
        return;
      }
      
      const shuffled = [...allAnime].sort(() => 0.5 - Math.random());
      
      setAnimeData({
        popular: shuffled.slice(0, 5),
        upcoming: shuffled.slice(5, 10),
        allTime: shuffled.slice(10, 15)
      });
    } catch (error) {
      console.error('Failed to fetch anime data:', error);
      setAnimeData({
        popular: [],
        upcoming: [],
        allTime: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimeData();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        🌸 Seasonal Anime
      </Typography>

      <AnimeSection 
        title="Popular This Season" 
        animeList={animeData.popular} 
        loading={loading} 
        onDelete={handleDeleteAnime}
      />
      
      <AnimeSection 
        title="Coming Soon" 
        animeList={animeData.upcoming} 
        loading={loading} 
        onDelete={handleDeleteAnime}
      />
      
      <AnimeSection 
        title="All Time Favorites" 
        animeList={animeData.allTime} 
        loading={loading} 
        onDelete={handleDeleteAnime}
      />
    </Container>
  );
};

export default Seasonal;