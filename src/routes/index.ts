import { Router } from "express";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import userRoutes from "./user.routes.js";

import jobRoutes from "./jobs.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/user", userRoutes);
router.use("/jobs", jobRoutes);

export default router;
