import express from "express";
import {
    loginWithFirebase,
    sendOTP,
    verifyOTP,
    verifyPhoneNumber,
    getCurrentUser,
    logout,
    updateProfile
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", loginWithFirebase);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/verify-phone", verifyPhoneNumber); // Legacy endpoint


router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);
router.put("/profile", protect, updateProfile);

export default router;
