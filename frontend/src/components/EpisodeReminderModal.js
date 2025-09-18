import React, { useState, useEffect } from 'react';
import { reminderService } from '../services/reminderService';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material';

const EpisodeReminderModal = ({ isOpen, onClose, anime, onSave }) => {
  const [reminderType, setReminderType] = useState('next_episode');
  const [nextEpisode, setNextEpisode] = useState(null);
  const [customSchedule, setCustomSchedule] = useState({
    dayOfWeek: 6, // Saturday
    time: '20:00'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && anime) {
      fetchNextEpisode();
    }
  }, [isOpen, anime]);

  const fetchNextEpisode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3003/api'}/episodes/anime/${anime.mal_id}/next`);
      if (response.ok) {
        const episode = await response.json();
        setNextEpisode(episode);
      }
    } catch (error) {
      console.error('Error fetching next episode:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const reminderData = {
        type: reminderType,
        animeId: anime.mal_id || anime._id,
        episodeNumber: nextEpisode?.episodeNumber || 1,
        customSchedule: reminderType === 'custom_schedule' ? customSchedule : undefined
      };
      
      console.log('Sending reminder data:', reminderData);
      await reminderService.createReminder(reminderData);
      onSave();
      onClose();
      alert('Reminder set successfully!');
    } catch (error) {
      console.error('Error setting reminder:', error);
      alert(`Failed to set reminder: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Set Reminder for {anime?.title}</DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Reminder Type</InputLabel>
            <Select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value)}
              label="Reminder Type"
            >
              <MenuItem value="next_episode">Next Episode</MenuItem>
              <MenuItem value="anime_start">Anime Start</MenuItem>
              <MenuItem value="custom_schedule">Custom Schedule</MenuItem>
            </Select>
          </FormControl>

          {reminderType === 'next_episode' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {nextEpisode ? (
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Next Episode: {nextEpisode.episodeNumber}
                  </Typography>
                  <Typography variant="body2">
                    Airs: {new Date(nextEpisode.releaseDate).toLocaleString()}
                  </Typography>
                  <Typography variant="caption">
                    You'll be notified 10 minutes before
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">No upcoming episodes found</Typography>
              )}
            </Alert>
          )}

          {reminderType === 'anime_start' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">Get notified when this anime starts airing</Typography>
            </Alert>
          )}

          {reminderType === 'custom_schedule' && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Schedule</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Day</InputLabel>
                  <Select
                    value={customSchedule.dayOfWeek}
                    onChange={(e) => setCustomSchedule({...customSchedule, dayOfWeek: parseInt(e.target.value)})}
                    label="Day"
                  >
                    {dayNames.map((day, index) => (
                      <MenuItem key={index} value={index}>{day}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  type="time"
                  label="Time"
                  value={customSchedule.time}
                  onChange={(e) => setCustomSchedule({...customSchedule, time: e.target.value})}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Weekly reminder every {dayNames[customSchedule.dayOfWeek]} at {customSchedule.time}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading || (reminderType === 'next_episode' && !nextEpisode)}
          >
            {loading ? 'Setting...' : 'Set Reminder'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EpisodeReminderModal;