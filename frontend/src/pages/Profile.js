import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



const mockFriends = [
  { id: 1, username: 'otakumaster', avatar: 'https://mui.com/static/images/avatar/2.jpg' },
  { id: 2, username: 'mangareader', avatar: 'https://mui.com/static/images/avatar/3.jpg' },
  { id: 3, username: 'animelover', avatar: 'https://mui.com/static/images/avatar/4.jpg' }
];

const mockClubs = [
  { id: 1, name: 'Shonen Fans', members: 1245 },
  { id: 2, name: 'Anime Theories', members: 876 },
  { id: 3, name: 'Manga Adaptations', members: 543 }
];

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isOwnProfile = username === user?.username;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, position: 'relative' }}>
        {isOwnProfile && (
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            sx={{ position: 'absolute', top: 16, right: 16 }}
            onClick={() => navigate('/settings')}
          >
            Edit Profile
          </Button>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>
              Bio
            </Typography>
            <Typography variant="body1" paragraph>
              {user?.bio || 'No bio available. Update your profile to add a bio!'}
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={4}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{watchlist.length}</Typography>
                  <Typography variant="body2">Anime</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{watchlist.reduce((total, item) => total + (item.episodesWatched || 0), 0)}</Typography>
                  <Typography variant="body2">Episodes</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{Math.round(watchlist.reduce((total, item) => total + (item.episodesWatched || 0), 0) * 24 / 60 / 24 * 10) / 10}</Typography>
                  <Typography variant="body2">Days Watched</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Watchlist" />
            <Tab label="Friends" />
            <Tab label="Clubs" />
            <Tab label="Activity" />
          </Tabs>
        </Box>
        
        {/* Watchlist Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {watchlist.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.anime._id}>
                  <Card sx={{ display: 'flex', height: '100%' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 100 }}
                      image={item.anime.poster}
                      alt={item.anime.title}
                    />
                    <CardContent sx={{ flex: '1 0 auto' }}>
                      <Typography component="div" variant="h6" noWrap>
                        {item.anime.title}
                      </Typography>
                      <Chip 
                        label={item.status.replace('-', ' ')}
                        size="small" 
                        color={
                          item.status === 'watching' ? 'primary' : 
                          item.status === 'completed' ? 'success' : 
                          item.status === 'on-hold' ? 'warning' : 'default'
                        }
                        sx={{ mb: 1, textTransform: 'capitalize' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Progress: {item.episodesWatched}/{item.anime.episodes}
                      </Typography>
                      {item.rating > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Score: {item.rating}/10
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Friends Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <List>
              {mockFriends.map((friend) => (
                <ListItem key={friend.id} button>
                  <ListItemAvatar>
                    <Avatar src={friend.avatar} />
                  </ListItemAvatar>
                  <ListItemText primary={friend.username} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {/* Clubs Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <List>
              {mockClubs.map((club) => (
                <ListItem key={club.id} button>
                  <ListItemText 
                    primary={club.name} 
                    secondary={`${club.members} members`} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {/* Activity Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="body1">
              Recent activity will be displayed here.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Profile;