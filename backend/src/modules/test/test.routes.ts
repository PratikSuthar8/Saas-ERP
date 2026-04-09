import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import {
  allowRoles,
  requireRoleLevel,
} from "../../common/middleware/role.middleware";

const router = Router();

// basic access
router.get("/data", protect, (req: any, res) => {
  res.json({
    success: true,
    tenantId: req.tenantId,
    roles: req.user.roles,
  });
});

// ADMIN only
router.get(
  "/admin-only",
  protect,
  allowRoles("ADMIN"),
  (req: any, res) => {
    res.json({
      success: true,
      message: "Admin access",
      roles: req.user.roles,
    });
  }
);

// MANAGER or above (ADMIN also allowed)
router.get(
  "/manager-level",
  protect,
  requireRoleLevel("MANAGER"),
  (req: any, res) => {
    res.json({
      success: true,
      message: "Manager level access",
      roles: req.user.roles,
    });
  }
);

// EMPLOYEE or above (everyone)
router.get(
  "/employee-level",
  protect,
  requireRoleLevel("EMPLOYEE"),
  (req: any, res) => {
    res.json({
      success: true,
      message: "Employee level access",
      roles: req.user.roles,
    });
  }
);

export default router;
