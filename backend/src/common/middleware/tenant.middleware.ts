import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const attachTenant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.tenantId) {
    return res.status(403).json({
      success: false,
      message: "Tenant not found",
    });
  }

  req.tenantId = req.user.tenantId;

  next();
};
