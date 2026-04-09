import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./purchase.controller";

const router = Router();

// Create purchase order → MANAGER+
router.post(
  "/",
  protect,
  requireRoleLevel("MANAGER"),
  controller.createPurchaseOrder
);

// Get purchase orders → EMPLOYEE+
router.get(
  "/",
  protect,
  requireRoleLevel("EMPLOYEE"),
  controller.getPurchaseOrders
);

export default router;
