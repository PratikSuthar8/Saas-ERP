import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./bom.controller";

const router = Router();

router.post("/", protect, requireRoleLevel("MANAGER"), controller.createBOM);
router.get("/", protect, requireRoleLevel("EMPLOYEE"), controller.getBOMs);
router.get("/:id", protect, requireRoleLevel("EMPLOYEE"), controller.getBOM);
router.put("/:id", protect, requireRoleLevel("MANAGER"), controller.updateBOM);
router.delete("/:id", protect, requireRoleLevel("MANAGER"), controller.deleteBOM);

export default router;
