import express from "express";
import {signup, login, sendOtp, verifyOtp} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;