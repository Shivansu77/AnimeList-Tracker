import React from 'react';
import {
  Container,
  Typography,
  Paper
} from '@mui/material';

const Analytics = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        My Anime Analytics
      </Typography>
      
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No analytics data available yet.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Start watching anime to see your analytics!
        </Typography>
      </Paper>
    </Container>
  );
};

export default Analytics;