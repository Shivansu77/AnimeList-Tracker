import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { CustomThemeProvider } from './context/ThemeContext';

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
import ReminderNotifications from './components/ReminderNotifications';
import Reminders from './pages/Reminders';
import AdminEpisodes from './pages/AdminEpisodes';
import AdminStreaming from './pages/AdminStreaming';
import AdminAnimeForm from './pages/AdminAnimeForm';
import SharedWatchlist from './pages/SharedWatchlist';

const AppContent = () => {
  return (
    <>
      <Navbar />
          <div style={{ paddingTop: '2rem', paddingBottom: '2rem', minHeight: '100vh' }}>
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
          <Route path="/admin/episodes" element={<AdminEpisodes />} />
          <Route path="/admin/streaming" element={<AdminStreaming />} />
          <Route path="/admin/anime/add" element={<AdminAnimeForm />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/watchlist/:shareToken" element={<SharedWatchlist />} />
          <Route path="/logout" element={<LogoutHandler />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <ReminderNotifications />
        <Chatbot />
        <Footer />
    </>
  );
};

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <AppContent />
        </WatchlistProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
