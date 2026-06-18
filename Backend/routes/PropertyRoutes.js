import express from "express";
import { addProperty, getProperties, addView, toggleLike, toggleFavorite , addComment} from "../controllers/propertyController.js";
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
router.post("/comment/:propertyId", authMiddleware, addComment);

export default router;