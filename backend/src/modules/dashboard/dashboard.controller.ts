import { Response } from "express";
import * as service from "./dashboard.service";

export const getDashboard = async (req: any, res: Response) => {
  const data = await service.getDashboardStats(req.tenantId);

  res.json({
    success: true,
    data,
  });
};
