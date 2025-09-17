import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// Anime services
export const animeService = {
  getAll: (params) => api.get('/anime', { params }),
  getById: (id) => api.get(`/anime/${id}`),
  create: (data) => api.post('/anime', data),
  update: (id, data) => api.put(`/anime/${id}`, data),
  delete: (id) => api.delete(`/anime/${id}`),
  getTrending: () => api.get('/anime/trending/now'),
  getTopRated: () => api.get('/anime/top/rated'),
  getRecommendations: () => api.get('/anime/recommendations/for-me'),
  updateWatchlistItem: (id, data) => api.post(`/anime/${id}/watchlist`, data),
  removeFromWatchlist: (id) => api.delete(`/anime/${id}/watchlist`),
  rateAnime: (id, rating) => api.post(`/anime/${id}/rate`, { rating })
};

// Club services
export const clubService = {
  getAll: () => api.get('/clubs'),
  getById: (id) => api.get(`/clubs/${id}`),
  create: (clubData) => api.post('/clubs', clubData),
  update: (id, clubData) => api.put(`/clubs/${id}`, clubData),
  delete: (id) => api.delete(`/clubs/${id}`),
  join: (id) => api.post(`/clubs/${id}/join`),
  leave: (id) => api.post(`/clubs/${id}/leave`),
  getPosts: (id) => api.get(`/clubs/${id}/posts`),
  createPost: (id, postData) => api.post(`/clubs/${id}/posts`, postData)
};

// User services
export const userService = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getWatchStats: () => api.get('/users/stats'),
  getWatchlist: () => api.get('/users/watchlist')
};

// Admin services
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getReports: () => api.get('/admin/reports'),
  handleReport: (id, action) => api.put(`/admin/reports/${id}`, { action })
};

export default api;