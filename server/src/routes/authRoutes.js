import express from "express";

import {
    register,
    login,
    logout,
    verifySession
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/verify", protect, verifySession);

export default router;