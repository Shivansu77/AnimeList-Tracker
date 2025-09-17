import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Rating,
  LinearProgress,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Skeleton
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useWatchlist } from '../context/WatchlistContext';

const WatchList = () => {
  const { watchlist, loading, updateWatchlistItem, removeFromWatchlist } = useWatchlist();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProgress, setEditProgress] = useState(0);
  const [editScore, setEditScore] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditOpen = () => {
    if (!selectedItem) return;
    setEditProgress(selectedItem.episodesWatched);
    setEditScore(selectedItem.rating || 0);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!selectedItem) return;
    try {
      await updateWatchlistItem(selectedItem.anime._id, {
        ...selectedItem,
        episodesWatched: editProgress,
        rating: editScore,
      });
    } catch (error) {
      console.error("Failed to save changes", error);
    }
    setEditDialogOpen(false);
  };

  const handleRemove = async () => {
    if (!selectedItem) return;
    try {
      await removeFromWatchlist(selectedItem.anime._id);
    } catch (error) {
      console.error("Failed to remove item", error);
    }
    handleMenuClose();
  };

  const categories = ['watching', 'completed', 'on-hold', 'dropped', 'plan-to-watch'];
  const currentCategory = categories[tabValue];
  const filteredList = watchlist.filter(item => item.status === currentCategory);

  const renderList = () => {
    if (loading) {
      return Array.from(new Array(3)).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ display: 'flex', p: 2 }}>
            <Skeleton variant="rectangular" width={80} height={120} />
            <CardContent sx={{ flexGrow: 1, pl: 2 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ));
    }

    if (filteredList.length === 0) {
      return (
        <Grid item xs={12}>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
            No anime in this category yet.
          </Typography>
        </Grid>
      );
    }

    return filteredList.map((item) => (
      <Grid item xs={12} sm={6} md={4} key={item.anime._id}>
        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', p: 2 }}>
            <CardMedia
              component="img"
              sx={{ width: 80, height: 120, objectFit: 'cover', borderRadius: 1 }}
              image={item.anime.poster}
              alt={item.anime.title}
            />
            <CardContent sx={{ flexGrow: 1, pl: 2, pr: 0, pt: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" noWrap sx={{ maxWidth: 'calc(100% - 40px)' }}>
                  {item.anime.title}
                </Typography>
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              {currentCategory !== 'plan-to-watch' && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.episodesWatched}/{item.anime.episodes} episodes
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.episodesWatched / item.anime.episodes) * 100} 
                    sx={{ mt: 1, mb: 1, height: 6, borderRadius: 3 }}
                  />
                </>
              )}
              {item.rating > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={item.rating} precision={0.5} size="small" readOnly />
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Last updated: {new Date(item.updatedAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Box>
        </Card>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        My Watchlist
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="watchlist tabs"
        >
          <Tab label="Watching" />
          <Tab label="Completed" />
          <Tab label="On Hold" />
          <Tab label="Dropped" />
          <Tab label="Plan to Watch" />
        </Tabs>
      </Box>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {renderList()}
      </Grid>
      
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditOpen}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Progress
        </MenuItem>
        <MenuItem onClick={handleRemove}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Remove from List
        </MenuItem>
      </Menu>
      
      {selectedItem && (
        <Dialog open={editDialogOpen} onClose={handleEditClose}>
          <DialogTitle>Update {selectedItem.anime.title}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Episodes</Typography>
              <TextField
                type="number"
                variant="outlined"
                size="small"
                fullWidth
                value={editProgress}
                onChange={(e) => setEditProgress(Math.min(parseInt(e.target.value) || 0, selectedItem.anime.episodes))}
                InputProps={{ 
                  inputProps: { min: 0, max: selectedItem.anime.episodes },
                  endAdornment: <Typography variant="body2">/ {selectedItem.anime.episodes}</Typography>
                }}
                sx={{ mb: 3 }}
              />
              <Typography variant="subtitle2" gutterBottom>Score</Typography>
              <Rating
                name="edit-score"
                value={editScore}
                precision={0.5}
                onChange={(event, newValue) => setEditScore(newValue)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleSaveChanges} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default WatchList;