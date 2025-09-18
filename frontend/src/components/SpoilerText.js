import React, { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const SpoilerText = ({ children, title = "Spoiler", inline = false }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const spoilerProtectionEnabled = localStorage.getItem('animeTracker_spoilerProtection') !== 'false';
  
  // If spoiler protection is disabled, always show content
  if (!spoilerProtectionEnabled) {
    return inline ? (
      <span>{children}</span>
    ) : (
      <Typography variant="body2">{children}</Typography>
    );
  }

  const handleToggle = () => {
    setIsRevealed(!isRevealed);
  };

  if (inline) {
    return (
      <Chip
        label={isRevealed ? children : "Spoiler"}
        onClick={handleToggle}
        icon={isRevealed ? <VisibilityOff /> : <Visibility />}
        variant={isRevealed ? "filled" : "outlined"}
        color={isRevealed ? "default" : "warning"}
        sx={{ 
          cursor: 'pointer',
          bgcolor: isRevealed ? 'transparent' : 'warning.light',
          '&:hover': { bgcolor: isRevealed ? 'action.hover' : 'warning.main' }
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'warning.main',
        borderRadius: 1,
        p: 2,
        mb: 2,
        bgcolor: isRevealed ? 'transparent' : 'warning.light',
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" color="warning.dark" fontWeight="bold">
          ⚠️ {title}
        </Typography>
        <Button
          size="small"
          startIcon={isRevealed ? <VisibilityOff /> : <Visibility />}
          onClick={handleToggle}
          variant="outlined"
          color="warning"
        >
          {isRevealed ? 'Hide' : 'Reveal'}
        </Button>
      </Box>
      
      {isRevealed ? (
        <Typography variant="body2">
          {children}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Click "Reveal" to show spoiler content
        </Typography>
      )}
    </Box>
  );
};

export default SpoilerText;