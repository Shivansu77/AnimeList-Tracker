import React from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import EditProfile from '../components/profile/EditProfile';

const Settings = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
        </Tabs>
      </Box>

      {tabValue === 0 && <EditProfile />}
      {tabValue === 1 && <Typography>Account settings will be here.</Typography>}
      {tabValue === 2 && <Typography>Notification settings will be here.</Typography>}
    </Container>
  );
};

export default Settings;
