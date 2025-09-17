import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, Paper, Alert, IconButton } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';

const EditProfile = () => {
  const { user, isAuthenticated, refreshUser, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  if (!isAuthenticated) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Not Signed In</Typography>
        <Typography sx={{ mb: 2 }}>You need to be logged in to edit your profile.</Typography>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/login"
        >
          Sign In
        </Button>
      </Paper>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Create a local URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, avatar: e.target.result });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    console.log('Updating profile with data:', formData);
    
    try {
      const response = await userService.updateProfile(formData);
      console.log('Profile update response:', response.data);
      setSuccess('Profile updated successfully!');
      
      // Update user data in auth context immediately
      if (response.data && response.data.user) {
        console.log('Setting new user data:', response.data.user);
        setUser(response.data.user);
      }
      
      // Also refresh from server
      if (refreshUser) {
        await refreshUser();
      }
      
      // Navigate to profile page to see changes
      setTimeout(() => {
        window.location.href = '/profile/me';
      }, 1000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Edit Your Profile</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={formData.avatar} 
            sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
          >
            {!formData.avatar && (formData.username?.charAt(0).toUpperCase() || 'U')}
          </Avatar>
          <Box>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="avatar-upload">
              <IconButton color="primary" component="span" disabled={uploading}>
                <PhotoCamera />
              </IconButton>
            </label>
            <Typography variant="body2" color="text.secondary">
              {uploading ? 'Uploading...' : 'Upload Avatar'}
            </Typography>
            {formData.avatar && (
              <Button 
                size="small" 
                onClick={() => setFormData({ ...formData, avatar: '' })}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Paper>
  );
};

export default EditProfile;
