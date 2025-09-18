import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Chip,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Rating,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
  Alert
} from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import CommentIcon from '@mui/icons-material/Comment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { animeService, reviewService } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import SpoilerText from '../components/SpoilerText';
import SpoilerTextEditor from '../components/SpoilerTextEditor';
import { SpoilerText as InlineSpoilerText } from '../components/SpoilerProtection';
import EpisodeReminderModal from '../components/EpisodeReminderModal';
import { reminderService } from '../services/reminderService';
import StreamingPlatforms from '../components/StreamingPlatforms';
import TrailerEmbed from '../components/TrailerEmbed';

const AnimeDetailSkeleton = () => (
  <Box sx={{ flexGrow: 1, py: 4 }}>
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs variant="fullWidth">
              <Tab label="Overview" />
              <Tab label="Characters" />
              <Tab label="Reviews" />
              <Tab label="Related" />
            </Tabs>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My List
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const AnimeDetail = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const { getWatchlistItem, updateWatchlistItem } = useWatchlist();
  const watchlistItem = getWatchlistItem(id);

  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [watchStatus, setWatchStatus] = useState('plan-to-watch');
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  
  // Debug modal state
  useEffect(() => {
    console.log('Reminder modal open:', reminderModalOpen);
  }, [reminderModalOpen]);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true);
        const res = await animeService.getById(id);
        let animeData = res.data;
        
        // Add sample streaming data if none exists
        if (!animeData.streamingPlatforms || animeData.streamingPlatforms.length === 0) {
          animeData.streamingPlatforms = [
            { name: 'Crunchyroll', url: 'https://www.crunchyroll.com', region: ['US', 'UK'] },
            { name: 'Netflix', url: 'https://www.netflix.com', region: ['Global'] }
          ];
        }
        
        // Add sample trailer if none exists
        if (!animeData.trailer) {
          animeData.trailer = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        }
        
        setAnime(animeData);
        
        // Load reviews
        try {
          const reviewsRes = await reviewService.getByAnime(id);
          setReviews(reviewsRes.data || []);
        } catch (reviewError) {
          console.log('No reviews found or error loading reviews');
          setReviews([]);
        }
      } catch (err) {
        setError('Failed to load anime details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, [id]);

  useEffect(() => {
    if (watchlistItem) {
      setWatchStatus(watchlistItem.status);
      setEpisodesWatched(watchlistItem.episodesWatched);
      setUserRating(watchlistItem.rating || 0);
    }
  }, [watchlistItem]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleWatchStatusChange = (status) => {
    setWatchStatus(status);
  };

  const handleSaveChanges = async () => {
    try {
      await updateWatchlistItem(id, {
        status: watchStatus,
        episodesWatched,
        rating: userRating,
      });
      
      // Also submit rating to anime
      if (userRating > 0) {
        await animeService.rateAnime(id, userRating);
      }
    } catch (err) {
      console.error('Failed to save changes:', err);
    }
  };
  
  const handleSubmitReview = async () => {
    if (!reviewText.trim() || userRating === 0) {
      alert('Please provide both a rating and review text.');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const newReview = await reviewService.create({
        anime: id,
        rating: userRating * 2, // Convert 5-star to 10-point scale
        content: reviewText,
        isSpoiler: reviewText.includes('||')
      });
      
      setReviews(prev => [newReview.data, ...prev]);
      setReviewText('');
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSaveReminder = () => {
    // Handled by the modal component
  };

  if (loading) return <AnimeDetailSkeleton />;
  if (error) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!anime) return null;

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      {/* Banner Section */}
      <Box
        sx={{
          height: '300px',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${anime.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box
                component="img"
                sx={{
                  width: '100%',
                  maxWidth: '225px',
                  borderRadius: 2,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                }}
                src={anime.poster}
                alt={anime.title}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Typography variant="h3" component="h1" color="white" gutterBottom>
                {anime.title}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {anime.genres?.map((genre) => (
                  <Chip 
                    key={genre} 
                    label={genre} 
                    sx={{ color: 'white', borderColor: 'white' }} 
                    variant="outlined" 
                  />
                )) || []}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip 
                  icon={<StarIcon />} 
                  label={`${anime.rating} / 10`} 
                  color="primary" 
                />
                <Chip 
                  label={`${anime.type} (${anime.episodes} episodes)`} 
                  variant="outlined" 
                  sx={{ color: 'white', borderColor: 'white' }} 
                />
                <Chip 
                  label={anime.status} 
                  variant="outlined" 
                  sx={{ color: 'white', borderColor: 'white' }} 
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<BookmarkAddIcon />}
                  sx={{ mb: 1 }}
                  onClick={handleSaveChanges}
                >
                  {watchlistItem ? 'Update List' : 'Add to List'}
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<NotificationsIcon />}
                  onClick={() => {
                    console.log('Set Reminder clicked');
                    setReminderModalOpen(true);
                  }}
                  sx={{ mb: 1, color: 'white', borderColor: 'white' }}
                >
                  Set Reminder
                </Button>
                {anime.streamingPlatforms?.map((platform, index) => (
                  <Button 
                    key={index}
                    variant="contained" 
                    color="secondary" 
                    startIcon={<PlayArrowIcon />}
                    href={platform.url}
                    target="_blank"
                    sx={{ mb: 1 }}
                  >
                    {platform.name}
                  </Button>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="anime tabs"
                variant="fullWidth"
              >
                <Tab label="Overview" />
                <Tab label="Characters" />
                <Tab label="Reviews" />
                <Tab label="Related" />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Synopsis
                </Typography>
                {anime.description?.includes('[SPOILER]') ? (
                  <SpoilerText title="Plot Spoiler">
                    {anime.description.replace('[SPOILER]', '')}
                  </SpoilerText>
                ) : (
                  <Typography paragraph>
                    {anime.description}
                  </Typography>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h5" gutterBottom>
                  Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Type:</Typography>
                    <Typography color="text.secondary">{anime.type}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Episodes:</Typography>
                    <Typography color="text.secondary">{anime.episodes}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Status:</Typography>
                    <Typography color="text.secondary">{anime.status}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Aired:</Typography>
                    <Typography color="text.secondary">{anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Studio:</Typography>
                    <Typography color="text.secondary">{anime.studio || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Duration:</Typography>
                    <Typography color="text.secondary">{anime.duration ? `${anime.duration} min` : 'N/A'}</Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                {anime.alternativeTitles?.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h5" gutterBottom>
                      Alternative Titles
                    </Typography>
                    <Grid container spacing={2}>
                      {anime.alternativeTitles.map((title, index) => (
                        <Grid item xs={12} key={index}>
                          <Typography color="text.secondary">{title}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
                
                <Divider sx={{ my: 3 }} />
                <StreamingPlatforms platforms={anime.streamingPlatforms} />
                
                <TrailerEmbed trailerUrl={anime.trailer} />
              </Box>
            )}

            {/* Characters Tab */}
            {tabValue === 1 && (
              <Box>
                {anime.characters?.length > 0 ? (
                  <Grid container spacing={2}>
                    {anime.characters.map((character, index) => (
                      <Grid item xs={12} sm={6} md={4} key={character.id || index}>
                        <Card sx={{ display: 'flex', height: '100%' }}>
                          <Box sx={{ width: '40%' }}>
                            <img 
                              src={character.image || 'https://via.placeholder.com/150x200'} 
                              alt={character.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <Box sx={{ width: '60%' }}>
                            <CardContent>
                              <Typography variant="subtitle1" component="div">
                                {character.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {character.role}
                              </Typography>
                            </CardContent>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography>No character information available.</Typography>
                )}
              </Box>
            )}

            {/* Reviews Tab */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  User Reviews
                </Typography>
                
                <Paper sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Write a Review
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Your Rating</Typography>
                    <Rating
                      name="user-rating"
                      value={userRating}
                      onChange={(event, newValue) => {
                        setUserRating(newValue);
                      }}
                      precision={0.5}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {userRating > 0 ? `${userRating * 2}/10` : 'No rating'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your Review
                    </Typography>
                    <SpoilerTextEditor
                      value={reviewText}
                      onChange={setReviewText}
                      placeholder="Share your thoughts about this anime... Use ||spoiler|| tags for spoilers."
                    />
                  </Box>
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<CommentIcon />}
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewText.trim() || userRating === 0}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Paper>
                
                {reviews.length > 0 ? (
                  <List>
                    {reviews.map((review, index) => (
                      <React.Fragment key={review._id || index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar alt={review.user?.username} src={review.user?.avatar}>
                              {review.user?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1">
                                  {review.user?.username || 'Anonymous'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Rating value={review.rating / 2} readOnly size="small" />
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    {review.rating}/10
                                  </Typography>
                                  {review.isSpoiler && (
                                    <Chip 
                                      label="Contains Spoilers" 
                                      size="small" 
                                      color="warning" 
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ display: 'block', mb: 1 }}
                                >
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <InlineSpoilerText
                                    content={review.content}
                                    className=""
                                  />
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No reviews yet. Be the first to review this anime!
                  </Typography>
                )}
              </Box>
            )}

            {/* Related Tab */}
            {tabValue === 3 && (
              <Typography>Related anime content will be displayed here.</Typography>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My List
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['watching', 'completed', 'on-hold', 'dropped', 'plan-to-watch'].map((status) => (
                      <Chip
                        key={status}
                        label={status.replace('-', ' ')}
                        onClick={() => handleWatchStatusChange(status)}
                        color={watchStatus === status ? 'primary' : 'default'}
                        variant={watchStatus === status ? 'filled' : 'outlined'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Episode Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={episodesWatched}
                      onChange={(e) => setEpisodesWatched(Math.min(anime.episodes, Math.max(0, parseInt(e.target.value) || 0)))}
                      inputProps={{ min: 0, max: anime.episodes }}
                      sx={{ width: '80px' }}
                    />
                    <Typography variant="body2">
                      / {anime.episodes} episodes
                    </Typography>
                  </Box>
                  
                  {/* Progress Bar */}
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <Box sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: 'grey.300', 
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        width: `${(episodesWatched / anime.episodes) * 100}%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                  </Box>
                  
                  {/* Episode Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', typography: 'caption' }}>
                    <Typography color="success.main" variant="caption">
                      Watched: {episodesWatched}
                    </Typography>
                    <Typography color="warning.main" variant="caption">
                      Pending: {anime.episodes - episodesWatched}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {Math.round((episodesWatched / anime.episodes) * 100)}%
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Your Rating
                  </Typography>
                  <Rating
                    name="simple-controlled"
                    value={userRating}
                    onChange={(event, newValue) => {
                      setUserRating(newValue);
                    }}
                  />
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Score:</Typography>
                  <Typography variant="body2" fontWeight="bold">{anime.rating}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Ranked:</Typography>
                  <Typography variant="body2" fontWeight="bold">#{anime.popularity}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Popularity:</Typography>
                  <Typography variant="body2" fontWeight="bold">#{anime.popularity}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Members:</Typography>
                  <Typography variant="body2" fontWeight="bold">{anime.members || 'N/A'}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      <EpisodeReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        anime={anime}
        onSave={handleSaveReminder}
      />
    </Box>
  );
};

export default AnimeDetail;