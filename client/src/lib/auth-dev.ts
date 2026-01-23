import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * DEV MODE: Direct login without Firebase (for testing)
 * Use this when Firebase is not configured
 */
export const loginDev = async (phoneNumber: string, name?: string) => {
  try {
    const response = await api.post('/auth/login', {
      phone: phoneNumber,
      name: name || 'Test User',
      email: `${phoneNumber}@dev.com`
    });

    // Store JWT token
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));

    return response.data;
  } catch (error: any) {
    console.error('Login failed:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Get current user from backend
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: { name?: string; phone?: string }) => {
  try {
    const response = await api.put('/auth/profile', data);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    return response.data;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error: any) {
    console.error('Error logging out:', error);
    // Clear local storage even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export default api;
