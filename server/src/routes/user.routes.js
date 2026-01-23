import express from "express";
import { getMe, updateProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, uploadSingle('profilePicture'), updateProfile);
router.put("/update-profile", verifyToken, uploadSingle('profilePicture'), updateProfile);

export default router;
