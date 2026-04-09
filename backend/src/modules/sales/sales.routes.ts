import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./sales.controller";

const router = Router();

// Create sale → MANAGER+
router.post(
  "/",
  protect,
  requireRoleLevel("MANAGER"),
  controller.createSale
);

// Get sales → EMPLOYEE+
router.get(
  "/",
  protect,
  requireRoleLevel("EMPLOYEE"),
  controller.getSales
);

export default router;
