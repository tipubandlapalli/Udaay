import { auth } from '@/config/firebase.config';
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
    PhoneAuthProvider,
    signInWithCredential
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

// Store confirmation result globally
let confirmationResult: ConfirmationResult | null = null;

/**
 * Initialize reCAPTCHA verifier
 * Must be called before sending OTP
 */
export const initializeRecaptcha = (elementId: string): RecaptchaVerifier => {
    // Clear any existing reCAPTCHA
    const existingRecaptcha = (window as any).recaptchaVerifier;
    if (existingRecaptcha) {
        existingRecaptcha.clear();
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {
            console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
            console.log('reCAPTCHA expired');
        }
    });

    (window as any).recaptchaVerifier = recaptchaVerifier;
    return recaptchaVerifier;
};

/**
 * Send OTP to phone number using Firebase or development mode
 * Falls back to backend OTP if Firebase is unavailable or in dev mode
 */
export const sendOTP = async (phoneNumber: string): Promise<void> => {
    // Check if we should use development mode
    const useDevAuth = import.meta.env.VITE_USE_DEV_AUTH === 'true';

    if (useDevAuth) {
        // Development mode: Use backend OTP
        console.log('🔧 DEV MODE: Using backend OTP instead of Firebase');

        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

        try {
            const response = await api.post('/auth/send-otp', {
                phoneNumber: formattedPhone
            });

            console.log('✅ DEV OTP sent:', response.data.otp || 'Check backend logs');

            // Store phone for verify step
            (window as any).devAuthPhone = formattedPhone;

            return;
        } catch (error: any) {
            console.error('Error sending dev OTP:', error);
            throw new Error(error.response?.data?.message || 'Failed to send OTP');
        }
    }

    // Production mode: Use Firebase
    try {
        // Ensure phone number has country code
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

        // Get or create reCAPTCHA verifier
        let recaptchaVerifier = (window as any).recaptchaVerifier;
        if (!recaptchaVerifier) {
            recaptchaVerifier = initializeRecaptcha('recaptcha-container');
        }

        // Send OTP
        confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);

        console.log('OTP sent successfully');
    } catch (error: any) {
        console.error('Error sending OTP:', error);

        // Clear reCAPTCHA on error
        const recaptchaVerifier = (window as any).recaptchaVerifier;
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            (window as any).recaptchaVerifier = null;
        }

        // If it's a Firebase configuration error, suggest dev mode
        if (error.code === 'auth/invalid-app-credential' || error.code === 'auth/configuration-not-found') {
            throw new Error('Firebase Phone Authentication is not configured for this domain. Enable VITE_USE_DEV_AUTH=true in .env.local to use development mode.');
        }

        throw new Error(error.message || 'Failed to send OTP');
    }
};

/**
 * Verify OTP code using Firebase or development mode
 */
export const verifyOTP = async (otpCode: string): Promise<any> => {
    const useDevAuth = import.meta.env.VITE_USE_DEV_AUTH === 'true';

    if (useDevAuth) {
        // Development mode: Verify with backend
        console.log('🔧 DEV MODE: Verifying OTP with backend');

        const phoneNumber = (window as any).devAuthPhone;
        if (!phoneNumber) {
            throw new Error('No phone number found. Please request OTP first.');
        }

        try {
            const response = await api.post('/auth/verify-otp', {
                phoneNumber,
                otp: otpCode,
                name: 'Test User',
                email: undefined
            });

            // Store JWT token
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));

            console.log('✅ DEV MODE: Login successful');

            return response.data;
        } catch (error: any) {
            console.error('Error verifying dev OTP:', error);
            throw new Error(error.response?.data?.message || 'Invalid OTP code. Please try again.');
        }
    }

    // Production mode: Use Firebase
    try {
        if (!confirmationResult) {
            throw new Error('No OTP request found. Please request OTP first.');
        }

        // Verify the OTP code
        const result = await confirmationResult.confirm(otpCode);
        const user = result.user;

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Send to backend for authentication
        const response = await api.post('/auth/login', {
            idToken,
            phone: user.phoneNumber,
            name: user.displayName || 'User',
            email: user.email
        });

        // Store JWT token
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        // Clear confirmation result
        confirmationResult = null;

        return response.data;
    } catch (error: any) {
        console.error('Error verifying OTP:', error);

        if (error.code === 'auth/invalid-verification-code') {
            throw new Error('Invalid OTP code. Please try again.');
        } else if (error.code === 'auth/code-expired') {
            throw new Error('OTP code has expired. Please request a new one.');
        }

        throw new Error(error.response?.data?.message || error.message || 'OTP verification failed');
    }
};

/**
 * Resend OTP
 */
export const resendOTP = async (phoneNumber: string): Promise<void> => {
    // Clear previous confirmation result
    confirmationResult = null;

    // Send new OTP
    await sendOTP(phoneNumber);
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
        await auth.signOut();
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
