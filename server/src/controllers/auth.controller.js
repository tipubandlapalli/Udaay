import admin, { firebaseInitialized } from "../config/firebase.config.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const loginWithFirebase = async (req, res) => {
    try {
        const { idToken, phone, name, email } = req.body;

        let decodedToken;

        // DEV MODE: Allow phone-based login without Firebase token
        // This works whether Firebase is initialized or not, for development/testing
        if (phone && (!idToken || idToken === '' || idToken === null || idToken === undefined)) {
            console.log("DEV MODE: Bypassing Firebase verification - phone login");

            decodedToken = {
                uid: `dev_${phone}`,
                phone_number: phone,
                email: email || `${phone}@dev.com`,
                name: name || "Test User"
            };
        } else if (!firebaseInitialized) {
            console.log("DEV MODE: Firebase not initialized");

            if (!phone) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number is required in dev mode"
                });
            }

            decodedToken = {
                uid: `dev_${phone}`,
                phone_number: phone,
                email: email || `${phone}@dev.com`,
                name: name || "Test User"
            };
        } else {
            if (!idToken) {
                return res.status(400).json({
                    success: false,
                    message: "Firebase ID token is required"
                });
            }

            try {
                decodedToken = await admin.auth().verifyIdToken(idToken);
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired token",
                    error: error.message
                });
            }
        }

        const { uid, phone_number, email: fbEmail, name: fbName } = decodedToken;

        let user = await User.findOne({
            $or: [
                { email: fbEmail || email },
                { phone: phone_number || phone }
            ]
        });

        if (!user) {
            user = await User.create({
                name: fbName || name || "User",
                email: fbEmail || email || `${uid}@guest.com`,
                phone: phone_number || phone,
                authProvider: phone_number ? "google" : "guest",
                role: "citizen"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    authProvider: user.authProvider
                },
                token,
                expiresIn: "30d"
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login",
            error: error.message
        });
    }
};

// Simple in-memory OTP storage (for development)
// In production, use Redis or database
const otpStorage = new Map();

export const sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 5 minute expiration
        otpStorage.set(phoneNumber, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        // In development, log the OTP
        console.log(`📱 OTP for ${phoneNumber}: ${otp}`);

        // In production, send SMS here
        // await sendSMS(phoneNumber, `Your OTP is: ${otp}`);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            // In development, return OTP in response
            ...(process.env.NODE_ENV === 'development' && { otp })
        });

    } catch (error) {
        console.error("Send OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during OTP send",
            error: error.message
        });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp, name, email } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required"
            });
        }

        // Check if OTP exists
        const storedData = otpStorage.get(phoneNumber);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new one."
            });
        }

        // Check if OTP expired
        if (Date.now() > storedData.expiresAt) {
            otpStorage.delete(phoneNumber);
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // OTP is valid, delete it
        otpStorage.delete(phoneNumber);

        // Find or create user
        let user = await User.findOne({ phone: phoneNumber });

        if (!user) {
            user = await User.create({
                name: name || "User",
                email: email || `${phoneNumber.replace(/\D/g, '')}@user.com`,
                phone: phoneNumber,
                authProvider: "phone",
                role: "citizen"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    authProvider: user.authProvider
                },
                token,
                expiresIn: "30d"
            }
        });

    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during OTP verification",
            error: error.message
        });
    }
};

// Keep old function name for compatibility
export const verifyPhoneNumber = sendOTP;

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-__v");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during logout",
            error: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: { user }
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during profile update",
            error: error.message
        });
    }
};
