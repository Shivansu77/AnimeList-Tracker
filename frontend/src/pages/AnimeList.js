import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Paper,
  Skeleton,
  IconButton
} from '@mui/material';
import { 
  Delete, 
  Star
} from '@mui/icons-material';
import { animeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AnimeCard = ({ anime, onDelete, showDelete }) => {
  return (
    <Card 
      sx={{ 
        height: 420,
        width: '100%',
        flex: 1,
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
          sx={{ height: 240, objectFit: 'cover' }}
          image={anime.poster || 'https://via.placeholder.com/200x240/f5f5f5/999?text=No+Image'}
          alt={anime.title}
        />
        
        {anime.averageRating > 0 && (
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

      <CardContent sx={{ p: 2, height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
            maxHeight: 48,
            '&:hover': { color: 'primary.main' }
          }}
        >
          {anime.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, minHeight: 32 }}>
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

const AnimeSection = ({ title, animeList, loading, showViewAll = true, onDelete }) => {
  const { user } = useAuth();

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        {showViewAll && (
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            View All
          </Button>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {loading ? (
          Array.from(new Array(5)).map((_, index) => (
            <Grid item xs={6} sm={4} md={2.4} key={index}>
              <Card sx={{ height: 420, width: '100%', flex: 1 }}>
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
            <Grid item xs={6} sm={4} md={2.4} key={anime._id} sx={{ display: 'flex' }}>
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

const AnimeList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const [selectedFormat, setSelectedFormat] = useState('');
  
  const [animeData, setAnimeData] = useState({
    trending: [],
    popular: [],
    upcoming: [],
    allTime: [],
    top100: []
  });
  const [loading, setLoading] = useState(true);
  const [availableGenres, setAvailableGenres] = useState([]);

  const years = ['2024', '2023', '2022', '2021', '2020'];

  const formats = ['TV', 'Movie', 'OVA', 'Special'];

  const handleDeleteAnime = async (animeId, animeTitle) => {
    if (window.confirm(`Are you sure you want to delete "${animeTitle}"?`)) {
      try {
        await animeService.delete(animeId);
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete anime:', error);
        alert('Failed to delete anime');
      }
    }
  };

  const fetchAnimeData = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (searchTerm) {
        params.q = searchTerm;
      }
      if (selectedGenre) {
        params.genre = selectedGenre;
      }
      if (selectedYear) {
        params.year = selectedYear;
      }
      if (selectedFormat) {
        params.type = selectedFormat;
      }
      const animeResponse = await animeService.getAll(params);
      
      const allAnime = animeResponse.data?.anime || animeResponse.data || [];
      
      if (allAnime.length === 0) {
        setAnimeData({
          trending: [],
          popular: [],
          upcoming: [],
          allTime: [],
          top100: []
        });
        setAvailableGenres(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy']);
        return;
      }
      
      const genres = [...new Set(allAnime.flatMap(anime => anime.genres || []))];
      setAvailableGenres(genres.length > 0 ? genres : ['Action', 'Adventure', 'Comedy']);
      
      const shuffled = [...allAnime].sort(() => 0.5 - Math.random());
      
      const sortedByRating = [...allAnime].sort((a, b) => {
        const ratingA = a.averageRating || a.rating || 0;
        const ratingB = b.averageRating || b.rating || 0;
        return ratingB - ratingA;
      });
      
      setAnimeData({
        trending: shuffled.slice(0, 5),
        popular: shuffled.slice(5, 10),
        upcoming: shuffled.slice(10, 15),
        allTime: shuffled.slice(15, 20),
        top100: sortedByRating.slice(0, 10).map((anime, index) => ({
          ...anime,
          rank: index + 1,
          displayRating: (anime.averageRating || anime.rating || 0).toFixed(1),
          users: anime.totalRatings || 0
        }))
      });
    } catch (error) {
      console.error('Failed to fetch anime data:', error);
      setAnimeData({
        trending: [],
        popular: [],
        upcoming: [],
        allTime: [],
        top100: []
      });
      setAvailableGenres(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = { limit: 50 };
        if (searchTerm) params.q = searchTerm;
        if (selectedGenre) params.genre = selectedGenre;
        if (selectedYear) params.year = selectedYear;
        if (selectedFormat) params.type = selectedFormat;
        
        const animeResponse = await animeService.getAll(params);
        const allAnime = animeResponse.data?.anime || animeResponse.data || animeResponse || [];
        
        if (allAnime.length === 0) {
          setAnimeData({ trending: [], popular: [], upcoming: [], allTime: [], top100: [] });
          setAvailableGenres(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy']);
          return;
        }
        
        const genres = [...new Set(allAnime.flatMap(anime => anime.genres || []))];
        setAvailableGenres(genres.length > 0 ? genres : ['Action', 'Adventure', 'Comedy']);
        
        const shuffled = [...allAnime].sort(() => 0.5 - Math.random());
        const sortedByRating = [...allAnime].sort((a, b) => {
          const ratingA = a.averageRating || a.rating || 0;
          const ratingB = b.averageRating || b.rating || 0;
          return ratingB - ratingA;
        });
        
        setAnimeData({
          trending: shuffled.slice(0, 5),
          popular: shuffled.slice(5, 10),
          upcoming: shuffled.slice(10, 15),
          allTime: shuffled.slice(15, 20),
          top100: sortedByRating.slice(0, 10).map((anime, index) => ({
            ...anime,
            rank: index + 1,
            displayRating: (anime.averageRating || anime.rating || 0).toFixed(1),
            users: anime.totalRatings || 0
          }))
        });
      } catch (error) {
        console.error('Failed to fetch anime data:', error);
        setAnimeData({ trending: [], popular: [], upcoming: [], allTime: [], top100: [] });
        setAvailableGenres(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy']);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm, selectedGenre, selectedYear, selectedFormat]);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Search</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search anime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Genres</InputLabel>
              <Select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {availableGenres.map(genre => <MenuItem key={genre} value={genre}>{genre}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {formats.map(format => <MenuItem key={format} value={format}>{format}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('');
                setSelectedYear('');

                setSelectedFormat('');
              }}
              sx={{ height: '56px' }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Anime Sections */}
      {/* Enhanced Trending Now Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 3,
          p: 2,
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          borderRadius: 3,
          color: 'white'
        }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255,255,255,0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mr: 2
          }}>
            <Typography variant="h5">🔥</Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Trending Now
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': { 
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            View All
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {loading ? (
            Array.from(new Array(5)).map((_, index) => (
              <Grid item xs={6} sm={4} md={2.4} key={index} sx={{ display: 'flex' }}>
                <Card sx={{ height: 420, width: '100%', flex: 1 }}>
                  <Skeleton variant="rectangular" height={240} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : animeData.trending.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No trending anime found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check back later for trending content!
                </Typography>
              </Paper>
            </Grid>
          ) : (
            animeData.trending.map((anime, index) => (
              <Grid item xs={6} sm={4} md={2.4} key={anime._id} sx={{ display: 'flex' }}>
                <Card 
                  sx={{ 
                    height: 420,
                    width: '100%',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(255, 107, 107, 0.3)'
                    }
                  }}
                >
                  {/* Trending Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      left: -8,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)'
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold" color="white">
                      #{index + 1}
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      sx={{ height: 260, objectFit: 'cover' }}
                      image={anime.poster || 'https://via.placeholder.com/200x260/f5f5f5/999?text=No+Image'}
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

                    {user?.isAdmin && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteAnime(anime._id, anime.title);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <CardContent sx={{ p: 2, height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                        maxHeight: 48,
                        '&:hover': { color: '#ff6b6b' }
                      }}
                    >
                      {anime.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, minHeight: 32 }}>
                      {anime.genres?.slice(0, 2).map(genre => (
                        <Chip 
                          key={genre} 
                          label={genre} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.75rem',
                            bgcolor: 'rgba(255, 107, 107, 0.1)',
                            color: '#ff6b6b',
                            border: '1px solid rgba(255, 107, 107, 0.3)'
                          }}
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
              </Grid>
            ))
          )}
        </Grid>
      </Box>
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

      {/* Top 100 Anime */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Top 100 Anime
        </Typography>
        
        {loading ? (
          Array.from(new Array(5)).map((_, index) => (
            <Paper key={index} sx={{ p: 3, mb: 2 }}>
              <Skeleton variant="text" width="100%" height={80} />
            </Paper>
          ))
        ) : (
          animeData.top100.map((anime) => (
            <Box key={anime.rank} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  minWidth: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #7c4dff 30%, #ff4081 90%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  zIndex: 1
                }}
              >
                <Typography variant="h5" fontWeight="bold" color="white">
                  #{anime.rank}
                </Typography>
              </Box>
              
              <Paper 
                component={RouterLink}
                to={`/anime/${anime._id}`}
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  flexGrow: 1,
                  '&:hover': { 
                    bgcolor: 'action.hover',
                    transform: 'translateX(8px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
              >
                
                <Box
                  sx={{
                    width: 60,
                    height: 80,
                    borderRadius: 2,
                    overflow: 'hidden',
                    mr: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  <img
                    src={anime.poster || 'https://via.placeholder.com/60x80/1a1a1a/ffffff?text=No+Image'}
                    alt={anime.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {anime.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {anime.genres?.slice(0, 4).map(genre => (
                      <Chip 
                        key={genre} 
                        label={genre} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star color="warning" />
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {anime.displayRating}/10
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {anime.users > 0 ? `${anime.users.toLocaleString()} users` : 'No ratings yet'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {anime.type} • {anime.episodes} episodes
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : 'N/A'}
                    </Typography>
                    <Chip 
                      label={anime.status} 
                      size="small" 
                      color="success"
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          ))
        )}
      </Box>
    </Container>
  );
};

export default AnimeList;