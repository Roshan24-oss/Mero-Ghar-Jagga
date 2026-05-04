import express from "express";
import { addProperty, getProperties } from "../controllers/propertyController.js";
import authMiddleware from "../middleware/authMiddlewares.js";

const router = express.Router();

// only owner can add
router.post("/", authMiddleware, addProperty);

// everyone can view
router.get("/",authMiddleware, getProperties);

export default router;