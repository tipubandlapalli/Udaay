import { auth } from '../config/firebase.config';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  UserCredential
} from 'firebase/auth';
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
 * Initialize reCAPTCHA verifier
 * @param containerId - ID of the HTML element for reCAPTCHA
 */
export const initializeRecaptcha = (containerId: string = 'recaptcha-container') => {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // Response expired
      }
    });
  }
  return (window as any).recaptchaVerifier;
};

/**
 * Send OTP to phone number
 * @param phoneNumber - Phone number with country code (e.g., +1234567890)
 */
export const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  try {
    const appVerifier = initializeRecaptcha();
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
};

/**
 * Verify OTP and login to backend
 * @param confirmationResult - Result from sendOTP
 * @param otp - OTP code entered by user
 */
export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<any> => {
  try {
    // Verify OTP with Firebase
    const result: UserCredential = await confirmationResult.confirm(otp);
    const user = result.user;

    // Get Firebase ID token
    const idToken = await user.getIdToken();

    // Send to backend
    const response = await api.post('/auth/login', {
      idToken,
      phone: user.phoneNumber,
    });

    // Store JWT token
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));

    return response.data;
  } catch (error: any) {
    console.error('OTP verification failed:', error);
    throw new Error(error.message || 'Invalid OTP');
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
    await auth.signOut();
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
