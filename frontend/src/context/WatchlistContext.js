import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { animeService, userService } from '../services/api';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext({
  watchlist: [],
  loading: false,
  error: null,
  fetchWatchlist: () => {},
  updateWatchlistItem: () => {},
  removeFromWatchlist: () => {},
  getWatchlistItem: () => null
});

export const WatchlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await userService.getWatchlist();
      const watchlistData = res.data || [];
      setWatchlist(watchlistData);
      // Backup to localStorage
      localStorage.setItem(`animeTracker_watchlist_${user.username}`, JSON.stringify(watchlistData));
    } catch (err) {
      // Load from localStorage backup if API fails
      const backup = localStorage.getItem(`animeTracker_watchlist_${user.username}`);
      if (backup) {
        setWatchlist(JSON.parse(backup));
      } else {
        setError('Failed to fetch watchlist.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Load from localStorage first for instant display
    if (user) {
      const backup = localStorage.getItem(`animeTracker_watchlist_${user.username}`);
      if (backup) {
        setWatchlist(JSON.parse(backup));
      }
    }
    fetchWatchlist();
  }, [fetchWatchlist]);

  const updateWatchlistItem = async (animeId, data) => {
    try {
      await animeService.updateWatchlistItem(animeId, data);
      await fetchWatchlist(); // Refetch to get the latest state
    } catch (err) {
      // Update localStorage backup even if API fails
      const updatedWatchlist = watchlist.map(item => 
        item.anime && item.anime._id === animeId ? { ...item, ...data } : item
      );
      setWatchlist(updatedWatchlist);
      if (user) {
        localStorage.setItem(`animeTracker_watchlist_${user.username}`, JSON.stringify(updatedWatchlist));
      }
      setError('Failed to update watchlist item.');
      console.error('Failed to update watchlist item:', err);
      throw err;
    }
  };

  const removeFromWatchlist = async (animeId) => {
    try {
      await animeService.removeFromWatchlist(animeId);
      const updatedWatchlist = watchlist.filter(item => item.anime && item.anime._id !== animeId);
      setWatchlist(updatedWatchlist);
      // Update localStorage backup
      if (user) {
        localStorage.setItem(`animeTracker_watchlist_${user.username}`, JSON.stringify(updatedWatchlist));
      }
    } catch (err) {
      setError('Failed to remove watchlist item.');
      console.error('Failed to remove watchlist item:', err);
      throw err;
    }
  };

  const getWatchlistItem = (animeId) => {
    return watchlist.find(item => item.anime && item.anime._id === animeId);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        error,
        fetchWatchlist,
        updateWatchlistItem,
        removeFromWatchlist,
        getWatchlistItem,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
