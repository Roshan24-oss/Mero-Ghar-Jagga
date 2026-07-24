import express from "express";
import { addProperty, getProperties, addView, toggleLike, toggleFavorite , addComment, deleteProperty, updateProperty, updatePropertyStatus} from "../controllers/propertyController.js";
import authMiddleware from "../middleware/authMiddlewares.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// only owner can add
router.post("/", authMiddleware, upload.fields([
    {name:"image", maxCount:5},
    {name:"video", maxCount:1}
]))


router.delete("/:propertyId", authMiddleware, deleteProperty);

// everyone can view
router.get("/",  getProperties);

router.post("/view/:propertyId", addView);
router.post("/like/:propertyId", authMiddleware, toggleLike);
router.post("/favorite/:propertyId", authMiddleware, toggleFavorite);
router.post("/comment/:propertyId", authMiddleware, addComment);

router.put("/:propertyId", authMiddleware, updateProperty);

router.put("/status/:propertyId",authMiddleware,updatePropertyStatus);
export default router;