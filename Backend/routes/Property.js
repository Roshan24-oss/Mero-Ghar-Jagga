// routes/property.js
import express from "express";
import Property from "../models/Property.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ADD PROPERTY (only owner)
router.post("/", protect, async (req, res) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ msg: "Only owner allowed" });
  }

  const property = await Property.create({
    ...req.body,
    owner: req.user.id,
  });

  res.json(property);
});

export default router;