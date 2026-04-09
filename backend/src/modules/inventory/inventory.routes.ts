import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./inventory.controller";

const router = Router();

// Create item → MANAGER+
router.post(
  "/",
  protect,
  requireRoleLevel("MANAGER"),
  controller.createItem
);

// Get items → EMPLOYEE+
router.get(
  "/",
  protect,
  requireRoleLevel("EMPLOYEE"),
  controller.getItems
);

// Update item → MANAGER+
router.put(
  "/:id",
  protect,
  requireRoleLevel("MANAGER"),
  controller.updateItem
);

// Delete item → MANAGER+
router.delete(
  "/:id",
  protect,
  requireRoleLevel("MANAGER"),
  controller.deleteItem
);

// Adjust stock → MANAGER+
router.post(
  "/adjust",
  protect,
  requireRoleLevel("MANAGER"),
  controller.adjustStock
);

// Get transaction history → EMPLOYEE+
router.get(
  "/transactions/:itemId",
  protect,
  requireRoleLevel("EMPLOYEE"),
  controller.getTransactions
);

export default router;
