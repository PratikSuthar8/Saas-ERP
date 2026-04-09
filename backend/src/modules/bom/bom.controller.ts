import { Response } from "express";
import * as service from "./bom.service";

export const createBOM = async (req: any, res: Response) => {
  const bom = await service.createBOM(req.body, req.tenantId);
  res.json({ success: true, data: bom });
};

export const getBOMs = async (req: any, res: Response) => {
  const boms = await service.getBOMs(req.tenantId);
  res.json({ success: true, data: boms });
};

export const getBOM = async (req: any, res: Response) => {
  const bom = await service.getBOM(req.params.id, req.tenantId);
  res.json({ success: true, data: bom });
};

export const updateBOM = async (req: any, res: Response) => {
  const bom = await service.updateBOM(req.params.id, req.body, req.tenantId);
  res.json({ success: true, data: bom });
};

export const deleteBOM = async (req: any, res: Response) => {
  await service.deleteBOM(req.params.id, req.tenantId);
  res.json({ success: true, message: "BOM deleted" });
};
