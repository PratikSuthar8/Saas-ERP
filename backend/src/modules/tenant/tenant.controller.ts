import { Response } from "express";
import * as service from "./tenant.service";

export const getTenant = async (req: any, res: Response) => {
  const tenant = await service.getTenant(req.tenantId);
  res.json({
    success: true,
    data: tenant,
  });
};

export const updateTenant = async (req: any, res: Response) => {
  const tenant = await service.updateTenant(req.tenantId, req.body);
  res.json({
    success: true,
    data: tenant,
  });
};
