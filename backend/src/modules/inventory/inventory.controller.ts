import { Response } from "express";
import * as service from "./inventory.service";

export const createItem = async (req: any, res: Response) => {
  const item = await service.createItem(req.body, req.tenantId);
  res.json({
    success: true,
    data: item,
  });
};

export const getItems = async (req: any, res: Response) => {
  const items = await service.getItems(req.tenantId);
  res.json({
    success: true,
    data: items,
  });
};

export const updateItem = async (req: any, res: Response) => {
  const { id } = req.params;
  const item = await service.updateItem(id, req.body, req.tenantId);
  res.json({
    success: true,
    data: item,
  });
};

export const deleteItem = async (req: any, res: Response) => {
  const { id } = req.params;
  await service.deleteItem(id, req.tenantId);
  res.json({
    success: true,
    message: "Item deleted successfully",
  });
};

export const adjustStock = async (req: any, res: Response) => {
  const item = await service.adjustStock(req.body, req.tenantId);
  res.json({
    success: true,
    data: item,
  });
};

export const getTransactions = async (req: any, res: Response) => {
  const { itemId } = req.params;
  const transactions = await service.getTransactions(itemId, req.tenantId);
  res.json({
    success: true,
    data: transactions,
  });
};
