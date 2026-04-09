import { Response } from "express";
import * as service from "./sales.service";

export const createSale = async (req: any, res: Response) => {
  const sale = await service.createSale(req.body, req.tenantId);

  res.json({
    success: true,
    data: sale,
  });
};

export const getSales = async (req: any, res: Response) => {
  const sales = await service.getSales(req.tenantId);

  res.json({
    success: true,
    data: sales,
  });
};
