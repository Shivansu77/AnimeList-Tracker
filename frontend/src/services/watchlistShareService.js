const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

export const watchlistShareService = {
  async shareWatchlist() {
    const response = await fetch(`${API_BASE_URL}/watchlist-share/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to share watchlist');
    return response.json();
  },

  async revokeSharing() {
    const response = await fetch(`${API_BASE_URL}/watchlist-share/share`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to revoke sharing');
    return response.json();
  },

  async getSharedWatchlist(shareToken) {
    const response = await fetch(`${API_BASE_URL}/watchlist-share/${shareToken}`);
    if (!response.ok) throw new Error('Failed to fetch shared watchlist');
    return response.json();
  },

  async getShareStatus() {
    const response = await fetch(`${API_BASE_URL}/watchlist-share/status/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to get share status');
    return response.json();
  }
};