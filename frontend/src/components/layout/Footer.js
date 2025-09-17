import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              AnimeTracker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your favorite anime and TV series, join discussions, and discover new shows.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="/anime" color="inherit">Browse Anime</Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="/clubs" color="inherit">Clubs</Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="/dashboard" color="inherit">Dashboard</Link>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="/terms" color="inherit">Terms of Service</Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="/privacy" color="inherit">Privacy Policy</Link>
            </Typography>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            <Link color="inherit" href="/">
              AnimeTracker
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;