import { Response } from "express";
import * as service from "./supplier.service";

export const createSupplier = async (req: any, res: Response) => {
  const supplier = await service.createSupplier(req.body, req.tenantId);
  res.json({
    success: true,
    data: supplier,
  });
};

export const getSuppliers = async (req: any, res: Response) => {
  const suppliers = await service.getSuppliers(req.tenantId);
  res.json({
    success: true,
    data: suppliers,
  });
};

export const updateSupplier = async (req: any, res: Response) => {
  const { id } = req.params;
  const supplier = await service.updateSupplier(id, req.body, req.tenantId);
  res.json({
    success: true,
    data: supplier,
  });
};

export const deleteSupplier = async (req: any, res: Response) => {
  const { id } = req.params;
  await service.deleteSupplier(id, req.tenantId);
  res.json({
    success: true,
    message: "Supplier deleted successfully",
  });
};
