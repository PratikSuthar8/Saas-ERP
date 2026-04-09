import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware";
import { requireRoleLevel } from "../../common/middleware/role.middleware";
import * as controller from "./sales.controller";

const router = Router();

router.post("/", protect, requireRoleLevel("MANAGER"), controller.createSale);
router.get("/", protect, requireRoleLevel("EMPLOYEE"), controller.getSales);
router.get("/:id", protect, requireRoleLevel("EMPLOYEE"), controller.getSale);
router.get("/:id/pdf", protect, requireRoleLevel("EMPLOYEE"), controller.downloadSalesOrderPDF);
router.put("/:id/status", protect, requireRoleLevel("MANAGER"), controller.updateSaleStatus);

export default router;
