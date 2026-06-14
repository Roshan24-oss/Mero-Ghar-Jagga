import express from "express";
import { addProperty, getProperties, addView, toggleLike, toggleFavorite } from "../controllers/propertyController.js";
import authMiddleware from "../middleware/authMiddlewares.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// only owner can add
router.post("/", authMiddleware, upload.array("images", 5), addProperty);

// everyone can view
router.get("/",getProperties);

router.post("/view/:propertyId", addView);
router.post("/like/:propertyId", authMiddleware, toggleLike);
router.post("/favorite/:propertyId", authMiddleware, toggleFavorite);

export default router;