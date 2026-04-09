import { Response } from "express";
import * as service from "./purchase.service";

export const createPurchaseOrder = async (req: any, res: Response) => {
  const order = await service.createPurchaseOrder(req.body, req.tenantId);

  res.json({
    success: true,
    data: order,
  });
};

export const getPurchaseOrders = async (req: any, res: Response) => {
  const orders = await service.getPurchaseOrders(req.tenantId);

  res.json({
    success: true,
    data: orders,
  });
};
