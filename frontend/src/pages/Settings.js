import React from 'react';
import { Container, Typography, Box, Tabs, Tab, Button, FormControlLabel, Switch } from '@mui/material';
import EditProfile from '../components/profile/EditProfile';

const Settings = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [spoilerProtection, setSpoilerProtection] = React.useState(() => {
    return localStorage.getItem('animeTracker_spoilerProtection') !== 'false';
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSpoilerProtectionChange = (event) => {
    const enabled = event.target.checked;
    setSpoilerProtection(enabled);
    localStorage.setItem('animeTracker_spoilerProtection', enabled.toString());
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label="Profile" />
          <Tab label="Account" />
          <Tab label="Notifications" />
          <Tab label="Data" />
        </Tabs>
      </Box>

      {tabValue === 0 && <EditProfile />}
      {tabValue === 1 && <Typography>Account settings will be here.</Typography>}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Content Preferences</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={spoilerProtection}
                onChange={handleSpoilerProtectionChange}
                color="primary"
              />
            }
            label="Enable Spoiler Protection"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            When enabled, content marked with [SPOILER] tags will be hidden and require clicking to reveal.
          </Typography>
        </Box>
      )}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Data Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your watchlist, likes, comments, and other data are stored permanently until you choose to delete them.
          </Typography>
          <Button 
            variant="outlined" 
            color="error"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all your local data? This will remove your watchlist, likes, comments, and notifications.')) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                  if (key.startsWith('animeTracker_')) {
                    localStorage.removeItem(key);
                  }
                });
                alert('All local data cleared successfully!');
                window.location.reload();
              }
            }}
          >
            Clear All Data
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Settings;
