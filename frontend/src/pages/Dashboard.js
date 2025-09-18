import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardMedia,
  Button,
  Divider,
  Skeleton,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { userService, animeService } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import ActivityFeed from '../components/ActivityFeed';

const DashboardSkeleton = () => (
  <Container maxWidth="lg">
    <Skeleton variant="text" width="40%" height={48} sx={{ mb: 4 }} />
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={120} /></Grid>
      <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={120} /></Grid>
      <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={120} /></Grid>
    </Grid>
    <Grid container spacing={4}>
      <Grid item xs={12} md={8}><Skeleton variant="rectangular" height={300} /></Grid>
      <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={300} /></Grid>
    </Grid>
  </Container>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  // Ensure recommendations is always an array
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Set fallback stats
        const fallbackStats = {
          totalAnime: 0,
          watching: 0,
          completed: 0,
          onHold: 0,
          dropped: 0,
          planToWatch: 0,
          totalEpisodesWatched: 0
        };
        
        try {
          const statsRes = await userService.getWatchStats();
          setStats(statsRes.data || fallbackStats);
        } catch (statsErr) {
          console.warn('Stats failed, using fallback:', statsErr);
          setStats(fallbackStats);
        }
        
        try {
          const recsRes = await animeService.getRecommendations();
          const recsData = recsRes.data;
          if (recsData && recsData.recommendations) {
            setRecommendations(recsData.recommendations);
          } else if (Array.isArray(recsData)) {
            setRecommendations(recsData);
          } else {
            setRecommendations([]);
          }
        } catch (recsErr) {
          console.warn('Recommendations failed:', recsErr);
          setRecommendations([]);
        }
        
      } catch (err) {
        console.error('Dashboard error:', err);
        setStats({
          totalAnime: 0,
          watching: 0,
          completed: 0,
          onHold: 0,
          dropped: 0,
          planToWatch: 0,
          totalEpisodesWatched: 0
        });
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!stats) return null;

  const recentlyUpdated = (watchlist || [])
    .filter(item => item && item.anime)
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 3);

  const statusData = [
    { name: 'Watching', value: stats?.watching || 0 },
    { name: 'Completed', value: stats?.completed || 0 },
    { name: 'On Hold', value: stats?.onHold || 0 },
    { name: 'Dropped', value: stats?.dropped || 0 },
    { name: 'Plan to Watch', value: stats?.planToWatch || 0 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Welcome back, {user?.username}!
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}><Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}><Typography variant="h6">Total Anime</Typography><Typography variant="h3">{stats?.totalAnime || 0}</Typography></Paper></Grid>
        <Grid item xs={12} md={4}><Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}><Typography variant="h6">Episodes Watched</Typography><Typography variant="h3">{stats?.totalEpisodesWatched || 0}</Typography></Paper></Grid>
        <Grid item xs={12} md={4}><Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}><Typography variant="h6">Days Watched</Typography><Typography variant="h3">{((stats?.totalEpisodesWatched || 0) * 24 / (60 * 24)).toFixed(1)}</Typography></Paper></Grid>
      </Grid>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Recently Updated</Typography>
              <Button component={RouterLink} to="/watchlist" variant="outlined" size="small">View All</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {recentlyUpdated.length > 0 ? (
                recentlyUpdated.map(({ anime }) => (
                  <Grid item xs={12} sm={4} key={anime._id}>
                    <Card sx={{ display: 'flex', height: '100%' }}>
                      <CardMedia component="img" sx={{ width: 70 }} image={anime.poster} alt={anime.title} />
                      <CardContent><Typography variant="subtitle1">{anime.title}</Typography></CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    No recent activity. Start watching some anime!
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>Activity Feed</Typography>
          <ActivityFeed />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>For You</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {safeRecommendations.length > 0 ? (
                safeRecommendations.slice(0, 4).map((anime) => (
                  <Grid item xs={12} key={anime._id}>
                    <Card sx={{ display: 'flex' }}>
                      <CardMedia component="img" sx={{ width: 60 }} image={anime.poster} alt={anime.title} />
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" noWrap>{anime.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {anime.reason || 'Recommended for you'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    No recommendations available.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;