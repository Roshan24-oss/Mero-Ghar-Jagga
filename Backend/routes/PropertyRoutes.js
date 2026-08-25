import express from "express";

import {
  addProperty,
  getProperties,
  getPropertyById,
  addView,
  toggleLike,
  toggleFavorite,
  addComment,
  deleteProperty,
  updateProperty,
  updatePropertyStatus,
} from "../controllers/propertyController.js";

import authMiddleware from "../middleware/authMiddlewares.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ===============================
// ADD PROPERTY
// ===============================
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  addProperty
);

// ===============================
// DELETE PROPERTY
// ===============================
router.delete(
  "/:propertyId",
  authMiddleware,
  deleteProperty
);

// ===============================
// GET ALL PROPERTIES
// ===============================
router.get("/", getProperties);

// ===============================
// GET SINGLE PROPERTY
// ===============================
router.get("/:id", getPropertyById);

// ===============================
// PROPERTY VIEWS
// ===============================
router.post(
  "/view/:propertyId",
  addView
);

// ===============================
// LIKE
// ===============================
router.post(
  "/like/:propertyId",
  authMiddleware,
  toggleLike
);

// ===============================
// FAVORITE
// ===============================
router.post(
  "/favorite/:propertyId",
  authMiddleware,
  toggleFavorite
);

// ===============================
// COMMENT
// ===============================
router.post(
  "/comment/:propertyId",
  authMiddleware,
  addComment
);

// ===============================
// UPDATE PROPERTY
// ===============================
router.put(
  "/:propertyId",
  authMiddleware,
  updateProperty
);

// ===============================
// UPDATE STATUS
// ===============================
router.put(
  "/status/:propertyId",
  authMiddleware,
  updatePropertyStatus
);

export default router;