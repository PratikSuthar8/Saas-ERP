import * as repo from "./sales.repository";
import { updateItemQuantity, createTransaction } from "../inventory/inventory.repository";
import { Tenant } from "../../db/models/Tenant";

export const createSale = async (payload: any, tenantId: string) => {
  const { items } = payload;
  
  const sale = await repo.createSale({
    tenantId,
    items,
  });
  
  for (const item of items) {
    await updateItemQuantity(item.itemId, -item.quantity);
    await createTransaction({
      tenantId,
      itemId: item.itemId,
      type: "OUT",
      quantity: item.quantity,
      note: "Sale",
    });
  }
  
  return sale;
};

export const getSales = async (tenantId: string) => {
  return repo.getSales(tenantId);
};

export const getSale = async (id: string, tenantId: string) => {
  return repo.getSale(id, tenantId);
};

export const updateSaleStatus = async (id: string, status: string, tenantId: string) => {
  return repo.updateSaleStatus(id, status, tenantId);
};

export const getCompanyDetails = async (tenantId: string) => {
  return Tenant.findById(tenantId);
};
