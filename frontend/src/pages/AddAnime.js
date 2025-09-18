import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { animeService } from '../services/api';

const AddAnime = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster: '',
    banner: '',
    genres: [],
    type: '',
    status: '',
    episodes: '',
    duration: '',
    releaseDate: '',
    studio: '',
    source: '',
    rating: '',
    trailer: '',
    streamingPlatforms: [{ name: '', url: '', region: [] }]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const genreOptions = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
    'Thriller', 'Historical', 'Psychological', 'Mecha', 'Music'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenreChange = (event) => {
    setFormData({
      ...formData,
      genres: event.target.value
    });
  };

  const addStreamingPlatform = () => {
    setFormData({
      ...formData,
      streamingPlatforms: [...formData.streamingPlatforms, { name: '', url: '', region: [] }]
    });
  };

  const updateStreamingPlatform = (index, field, value) => {
    const updated = [...formData.streamingPlatforms];
    if (field === 'region') {
      updated[index][field] = value.split(',').map(r => r.trim()).filter(r => r);
    } else {
      updated[index][field] = value;
    }
    setFormData({ ...formData, streamingPlatforms: updated });
  };

  const removeStreamingPlatform = (index) => {
    const updated = formData.streamingPlatforms.filter((_, i) => i !== index);
    setFormData({ ...formData, streamingPlatforms: updated });
  };

  const handleImageUpload = async (event, field) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await fetch('http://localhost:3003/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataUpload
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({
          ...formData,
          [field]: data.imageUrl
        });
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data with proper formatting
      const submitData = {
        ...formData,
        episodes: parseInt(formData.episodes) || 1,
        rating: formData.rating ? Math.max(0, Math.min(10, parseFloat(formData.rating))) : 0,
        poster: formData.poster || 'https://via.placeholder.com/300x400'
      };
      
      await animeService.create(submitData);
      setSuccess('Anime created successfully!');
      setError('');
      setTimeout(() => navigate('/anime'), 2000);
    } catch (err) {
      console.error('Create anime error:', err);
      setError(err.response?.data?.message || 'Failed to create anime');
      setSuccess('');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Anime
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Poster URL"
                  name="poster"
                  value={formData.poster}
                  onChange={handleChange}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="poster-upload"
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'poster')}
                />
                <label htmlFor="poster-upload">
                  <IconButton color="primary" component="span" disabled={uploading}>
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Banner URL"
                  name="banner"
                  value={formData.banner}
                  onChange={handleChange}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="banner-upload"
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'banner')}
                />
                <label htmlFor="banner-upload">
                  <IconButton color="primary" component="span" disabled={uploading}>
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Genres</InputLabel>
                <Select
                  multiple
                  name="genres"
                  value={formData.genres}
                  onChange={handleGenreChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {genreOptions.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <MenuItem value="TV">TV</MenuItem>
                  <MenuItem value="Movie">Movie</MenuItem>
                  <MenuItem value="OVA">OVA</MenuItem>
                  <MenuItem value="ONA">ONA</MenuItem>
                  <MenuItem value="Special">Special</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="Airing">Airing</MenuItem>
                  <MenuItem value="Finished">Finished</MenuItem>
                  <MenuItem value="Not yet aired">Not yet aired</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Episodes"
                name="episodes"
                value={formData.episodes}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (e.g., 24 min)"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Release Date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Studio"
                name="studio"
                value={formData.studio}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Source"
                name="source"
                value={formData.source}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Rating (1-10)"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                helperText="Enter rating from 0-10 (0 = no rating)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="YouTube Trailer URL"
                name="trailer"
                value={formData.trailer}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
                helperText="Paste YouTube video URL for the trailer"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Streaming Platforms
              </Typography>
              {formData.streamingPlatforms.map((platform, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Platform</InputLabel>
                        <Select
                          value={platform.name}
                          onChange={(e) => updateStreamingPlatform(index, 'name', e.target.value)}
                        >
                          <MenuItem value="Crunchyroll">Crunchyroll</MenuItem>
                          <MenuItem value="Netflix">Netflix</MenuItem>
                          <MenuItem value="Disney+">Disney+</MenuItem>
                          <MenuItem value="Funimation">Funimation</MenuItem>
                          <MenuItem value="Hulu">Hulu</MenuItem>
                          <MenuItem value="Amazon Prime">Amazon Prime</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="URL"
                        value={platform.url}
                        onChange={(e) => updateStreamingPlatform(index, 'url', e.target.value)}
                        placeholder="https://..."
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Regions"
                        value={platform.region.join(', ')}
                        onChange={(e) => updateStreamingPlatform(index, 'region', e.target.value)}
                        placeholder="US, UK, CA"
                        helperText="Comma separated"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      {formData.streamingPlatforms.length > 1 && (
                        <Button
                          color="error"
                          onClick={() => removeStreamingPlatform(index)}
                          sx={{ mt: 1 }}
                        >
                          Remove
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                variant="outlined"
                onClick={addStreamingPlatform}
                sx={{ mb: 2 }}
              >
                Add Streaming Platform
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/anime')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Create Anime
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddAnime;