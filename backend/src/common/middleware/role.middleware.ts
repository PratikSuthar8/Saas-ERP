import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { hasMinimumRole } from "../utils/roleHierarchy";

export const allowRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];

    const hasAccess = allowedRoles.some(role =>
      userRoles.includes(role)
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

// NEW: hierarchy-based middleware
export const requireRoleLevel = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];

    if (!hasMinimumRole(userRoles, role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient role level",
      });
    }

    next();
  };
};
