import React from 'react';
import { Box, Typography } from '@mui/material';

const TrailerEmbed = ({ trailerUrl }) => {
  if (!trailerUrl) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Trailer
        </Typography>
        <Typography color="text.secondary">No trailer available</Typography>
      </Box>
    );
  }

  // Extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(trailerUrl);

  if (!videoId) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Trailer
      </Typography>
      <Box sx={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
        <Box
          component="iframe"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 2,
            boxShadow: 3
          }}
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Anime Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
    </Box>
  );
};

export default TrailerEmbed;