import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./auth.controller";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/change-password", protect, controller.changePassword);
router.post(
  "/create-user",
  protect,
  requireRoleLevel("ADMIN"),
  controller.createUser
);
router.post(
  "/invite",
  protect,
  requireRoleLevel("ADMIN"),
  controller.inviteUser
);

export default router;
