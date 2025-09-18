const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const streamingService = {
  async getPlatforms() {
    const response = await fetch(`${API_BASE_URL}/streaming/platforms`);
    if (!response.ok) throw new Error('Failed to fetch platforms');
    return response.json();
  },

  async getAnimeStreaming(animeId) {
    const response = await fetch(`${API_BASE_URL}/streaming/anime/${animeId}`);
    if (!response.ok) throw new Error('Failed to fetch streaming links');
    return response.json();
  },

  async addPlatform(platformData) {
    const response = await fetch(`${API_BASE_URL}/streaming/platforms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(platformData)
    });
    if (!response.ok) throw new Error('Failed to add platform');
    return response.json();
  },

  async addStreamingLink(animeId, linkData) {
    const response = await fetch(`${API_BASE_URL}/streaming/anime/${animeId}/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(linkData)
    });
    if (!response.ok) throw new Error('Failed to add streaming link');
    return response.json();
  },

  async updateStreamingLink(linkId, linkData) {
    const response = await fetch(`${API_BASE_URL}/streaming/links/${linkId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(linkData)
    });
    if (!response.ok) throw new Error('Failed to update streaming link');
    return response.json();
  },

  async deleteStreamingLink(linkId) {
    const response = await fetch(`${API_BASE_URL}/streaming/links/${linkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete streaming link');
    return response.json();
  }
};