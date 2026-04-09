import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./user.controller";

const router = Router();

// Get current user info
router.get("/me", protect, controller.getCurrentUser);

// Get all users (ADMIN only)
router.get(
  "/",
  protect,
  requireRoleLevel("ADMIN"),
  controller.getUsers
);

// Update user roles (ADMIN only)
router.put(
  "/:id/roles",
  protect,
  requireRoleLevel("ADMIN"),
  controller.updateUserRole
);

// Delete user (ADMIN only)
router.delete(
  "/:id",
  protect,
  requireRoleLevel("ADMIN"),
  controller.deleteUser
);

// Update own profile
router.put("/profile", protect, controller.updateProfile);

// Change own password
router.post("/change-password", protect, controller.changePassword);

export default router;
