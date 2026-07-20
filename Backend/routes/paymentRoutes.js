import express from "express"
import{paymentSignature, verifySignature, checkAccess} from "../controllers/paymentControllers.js"
import authMiddleware from "../middleware/authMiddlewares.js";

const router = express.Router();

router.post("/signature",authMiddleware, paymentSignature);
router.post("/verify", authMiddleware, verifySignature);
router.get("/access/:propertyId", authMiddleware, checkAccess);

export default router;