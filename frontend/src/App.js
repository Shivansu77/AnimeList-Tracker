import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page Components
import Home from './pages/Home';
import AnimeList from './pages/AnimeList';
import AnimeDetail from './pages/AnimeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';

// New Features
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import WatchList from './pages/WatchList';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import AddAnime from './pages/AddAnime';
import Seasonal from './pages/Seasonal';
import Recommendations from './pages/Recommendations';
import LogoutHandler from './components/LogoutHandler';
import Chatbot from './components/Chatbot';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#7c4dff',
      },
      secondary: {
        main: '#f50057',
      },
    },
  });

  return (
    <AuthProvider>
      <WatchlistProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <Container component="main" sx={{ pt: 8, pb: 8, minHeight: '100vh' }}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime" element={<AnimeList />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/seasonal" element={<Seasonal />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/profile/me" element={<Profile />} />
          <Route path="/profile/me/list" element={<WatchList />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/watchlist" element={<WatchList />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/add-anime" element={<AddAnime />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<LogoutHandler />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
          <Chatbot />
          <Footer />
        </ThemeProvider>
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
