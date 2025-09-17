import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Skeleton,
  Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Search as SearchIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Comment as CommentIcon,
  TrendingUp,
  Star,
  Forum,
  Event,
  Send
} from '@mui/icons-material';
import { clubService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ClubCardSkeleton = () => (
  <Grid item xs={12} sm={6} md={4}>
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={140} />
      <CardContent>
        <Skeleton variant="text" height={32} />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </CardContent>
    </Card>
  </Grid>
);

const Clubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  
  // Ensure clubs is always an array
  const clubsArray = Array.isArray(clubs) ? clubs : [];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    tags: ''
  });

  // Mock data for enhanced features
  const [featuredClubs] = useState([
    { id: 1, name: 'Shonen Enthusiasts', members: 1250, trending: true, featured: true },
    { id: 2, name: 'Studio Ghibli Fans', members: 890, trending: true, featured: true },
    { id: 3, name: 'Manga Readers', members: 2100, trending: false, featured: true }
  ]);

  const [recentActivity] = useState([
    { user: 'AnimeKing', action: 'joined', club: 'Shonen Enthusiasts', time: '2 min ago' },
    { user: 'MangaLover', action: 'posted in', club: 'Manga Readers', time: '5 min ago' },
    { user: 'GhibliFan', action: 'created event in', club: 'Studio Ghibli Fans', time: '10 min ago' }
  ]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const params = { q: searchTerm };
        const res = await clubService.getAll(params);
        setClubs(res.data || []);
      } catch (err) {
        setError('Failed to load clubs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleNewClubChange = (event) => {
    const { name, value } = event.target;
    setNewClub({ ...newClub, [name]: value });
  };

  const handleCreateClub = async () => {
    try {
      const clubData = {
        ...newClub,
        tags: newClub.tags.split(',').map(tag => tag.trim()),
      };
      const res = await clubService.create(clubData);
      setClubs([res.data, ...clubsArray]);
      handleCreateDialogClose();
      setNewClub({ name: '', description: '', tags: '' });
    } catch (err) {
      console.error('Failed to create club', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🏛️ Anime Clubs
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Join communities, discuss anime, and make friends!
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
          sx={{ 
            background: 'linear-gradient(45deg, #7c4dff 30%, #ff4081 90%)',
            boxShadow: '0 3px 5px 2px rgba(124, 77, 255, .3)'
          }}
        >
          Create Club
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<Forum />} label="All Clubs" />
          <Tab icon={<TrendingUp />} label="Trending" />
          <Tab icon={<Star />} label="Featured" />
          <Tab icon={<Event />} label="My Clubs" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search clubs by name, description, or tags..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Club Cards */}
          <Grid container spacing={3}>
            {loading ? (
              Array.from(new Array(6)).map((_, index) => <ClubCardSkeleton key={index} />)
            ) : (
              clubsArray.map((club) => (
                <Grid item xs={12} sm={6} key={club._id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={club.avatar || 'https://via.placeholder.com/300x120/7c4dff/ffffff?text=Club'}
                      alt={club.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component={RouterLink} to={`/clubs/${club._id}`} 
                          sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                          {club.name}
                        </Typography>
                        {club.trending && (
                          <Chip icon={<TrendingUp />} label="Trending" size="small" color="error" />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {club.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {club.tags?.slice(0, 3).map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                              {club.memberCount || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CommentIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                              {club.postCount || 0}
                            </Typography>
                          </Box>
                        </Box>
                        <Button 
                          variant="contained" 
                          size="small" 
                          component={RouterLink} 
                          to={`/clubs/${club._id}`}
                        >
                          Join
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Featured Clubs */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Star sx={{ mr: 1, color: 'warning.main' }} />
              Featured Clubs
            </Typography>
            <List>
              {featuredClubs.map((club, index) => (
                <ListItem key={club.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {club.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={club.name}
                    secondary={`${club.members} members`}
                  />
                  {club.trending && (
                    <Badge badgeContent="🔥" color="error" />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Forum sx={{ mr: 1, color: 'info.main' }} />
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <strong>{activity.user}</strong> {activity.action} <strong>{activity.club}</strong>
                      </Typography>
                    }
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Quick Stats */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Community Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total Clubs:</Typography>
                <Typography variant="body2" fontWeight="bold">{clubsArray.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Active Members:</Typography>
                <Typography variant="body2" fontWeight="bold">12,450</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Posts Today:</Typography>
                <Typography variant="body2" fontWeight="bold">89</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Create Club Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Club</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Club Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newClub.name}
            onChange={handleNewClubChange}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newClub.description}
            onChange={handleNewClubChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="tags"
            label="Tags (comma separated)"
            type="text"
            fullWidth
            variant="outlined"
            placeholder="e.g., Shonen, Action, Fantasy"
            value={newClub.tags}
            onChange={handleNewClubChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateClub} 
            variant="contained"
            disabled={!newClub.name || !newClub.description}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Clubs;