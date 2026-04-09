import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./tenant.controller";

const router = Router();

// Get company settings (ADMIN only)
router.get(
  "/",
  protect,
  requireRoleLevel("ADMIN"),
  controller.getTenant
);

// Update company settings (ADMIN only)
router.put(
  "/",
  protect,
  requireRoleLevel("ADMIN"),
  controller.updateTenant
);

export default router;
