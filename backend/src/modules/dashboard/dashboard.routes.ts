import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import * as controller from "./dashboard.controller";

const router = Router();

// Dashboard API
router.get("/", protect, controller.getDashboard);

export default router;
