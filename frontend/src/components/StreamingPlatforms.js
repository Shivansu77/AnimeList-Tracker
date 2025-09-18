import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const StreamingPlatforms = ({ platforms }) => {
  if (!platforms || platforms.length === 0) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Watch Now
        </Typography>
        <Typography color="text.secondary">No streaming platforms available</Typography>
      </Box>
    );
  }



  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Watch Now
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {platforms.map((platform, index) => (
          <Button
            key={index}
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mb: 1 }}
          >
            {platform.name}
            {platform.region && platform.region.length > 0 && (
              <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
                ({platform.region.join(', ')})
              </Typography>
            )}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default StreamingPlatforms;