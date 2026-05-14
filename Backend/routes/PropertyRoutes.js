import express from "express";
import { addProperty, getProperties } from "../controllers/propertyController.js";
import authMiddleware from "../middleware/authMiddlewares.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// only owner can add
router.post("/", authMiddleware, upload.array("images", 5), addProperty);

// everyone can view
router.get("/",getProperties);

export default router;