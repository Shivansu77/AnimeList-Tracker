import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Chip,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { adminService } from '../services/api';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersRes = await adminService.getUsers();
        setUsers(usersRes.data);
      } catch (err) {
        setError('Failed to load admin data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditUserOpen = (user) => {
    setSelectedUser({ ...user });
    setEditUserDialogOpen(true);
  };

  const handleEditUserClose = () => {
    setEditUserDialogOpen(false);
  };

  const handleSaveUserChanges = async () => {
    try {
      const { _id, role, status } = selectedUser;
      const res = await adminService.updateUser(_id, { role, status });
      setUsers(users.map(u => (u._id === _id ? res.data : u)));
      handleEditUserClose();
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return <Skeleton variant="rectangular" height={300} />;
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    switch (tabValue) {
      case 0: // User Management
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Chip label={user.role} color={user.role === 'admin' ? 'secondary' : 'default'} size="small" /></TableCell>
                    <TableCell><Chip label={user.status || 'active'} color={user.status === 'suspended' ? 'error' : 'success'} size="small" /></TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditUserOpen(user)}><EditIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 1: // Content Moderation
        return (
          <Typography>Content moderation section is under development.</Typography>
        );
      case 2: // Club Management
        return (
          <Typography>Club management section is under development.</Typography>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Admin Panel</Typography>
        <Button
          component={RouterLink}
          to="/admin/add-anime"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Anime
        </Button>
      </Box>
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="User Management" />
          <Tab label="Content Moderation" />
          <Tab label="Club Management" />
        </Tabs>
        <Box sx={{ p: 3 }}>{renderTabContent()}</Box>
      </Paper>
      {selectedUser && (
        <Dialog open={editUserDialogOpen} onClose={handleEditUserClose}>
          <DialogTitle>Edit User: {selectedUser.username}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField label="Email" fullWidth value={selectedUser.email} disabled margin="normal" />
              <FormControlLabel
                control={<Switch checked={selectedUser.role === 'admin'} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.checked ? 'admin' : 'user' })} />}
                label="Admin Role"
                sx={{ mt: 2, display: 'block' }}
              />
              <FormControlLabel
                control={<Switch checked={selectedUser.status !== 'suspended'} onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.checked ? 'active' : 'suspended' })} />}
                label="Active Status"
                sx={{ mt: 1, display: 'block' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditUserClose}>Cancel</Button>
            <Button onClick={handleSaveUserChanges} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default AdminPanel;