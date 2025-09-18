import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Search for anime by title
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of anime results
 */
const searchAnime = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/anime/search`, {
      params: { 
        q: query, 
        limit: 5 // Limit to 5 results for dropdown
      }
    });
    // Return just the results array for the Navbar component
    return response.data.results || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export default {
  searchAnime
};
