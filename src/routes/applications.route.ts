import { Router } from "express";
import { scanGmailForApplications } from "../controllers/applications.controller.js";

const router = Router();

router.get("/first-sync", scanGmailForApplications);

export default router;
