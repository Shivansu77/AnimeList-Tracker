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

  const platformLogos = {
    'Crunchyroll': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Crunchyroll_2018.svg/1200px-Crunchyroll_2018.svg.png',
    'Netflix': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png',
    'Disney+': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/1200px-Disney%2B_logo.svg.png',
    'Funimation': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Funimation_2016.svg/1200px-Funimation_2016.svg.png',
    'Hulu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Hulu_Logo.svg/1200px-Hulu_Logo.svg.png'
  };

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