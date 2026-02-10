import { Router } from "express";
import {
  googleAuth,
  googleCallback,
  getMe,
  googleUpgrade,
  googleUpgradeCallback,
} from "../controllers/auth.controller.js";
// import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Matches Next.js: app/api/auth/google/route.ts
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/google/upgrade", googleUpgrade);
router.get("/google/callback/upgrade", googleUpgradeCallback);
router.get("/me", getMe);
export default router;
