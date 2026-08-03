import express from "express";

import {getTrendingProperties} from "../controllers/trendingProperty.js";

const router = express.Router();

router.get("/:type", getTrendingProperties);
export default router;