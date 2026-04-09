import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./supplier.controller";

const router = Router();

// Create supplier → MANAGER+
router.post(
  "/",
  protect,
  requireRoleLevel("MANAGER"),
  controller.createSupplier
);

// Get suppliers → EMPLOYEE+
router.get(
  "/",
  protect,
  requireRoleLevel("EMPLOYEE"),
  controller.getSuppliers
);

// Update supplier → MANAGER+
router.put(
  "/:id",
  protect,
  requireRoleLevel("MANAGER"),
  controller.updateSupplier
);

// Delete supplier → MANAGER+
router.delete(
  "/:id",
  protect,
  requireRoleLevel("MANAGER"),
  controller.deleteSupplier
);

export default router;
