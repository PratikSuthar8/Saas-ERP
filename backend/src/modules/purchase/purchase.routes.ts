import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./purchase.controller";

const router = Router();

router.post("/", protect, requireRoleLevel("MANAGER"), controller.createPurchaseOrder);
router.get("/", protect, requireRoleLevel("EMPLOYEE"), controller.getPurchaseOrders);
router.get("/:id", protect, requireRoleLevel("EMPLOYEE"), controller.getPurchaseOrder);
router.get("/:id/pdf", protect, requireRoleLevel("EMPLOYEE"), controller.downloadPurchaseOrderPDF);

export default router;
