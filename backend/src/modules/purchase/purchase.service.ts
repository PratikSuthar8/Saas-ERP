import * as repo from "./purchase.repository";
import { updateItemQuantity, createTransaction } from "../inventory/inventory.repository";
import { Tenant } from "../../db/models/Tenant";

export const createPurchaseOrder = async (payload: any, tenantId: string) => {
  const { supplierId, items } = payload;

  const order = await repo.createPurchaseOrder({
    tenantId,
    supplierId,
    items,
  });

  for (const item of items) {
    await updateItemQuantity(item.itemId, item.quantity);
    await createTransaction({
      tenantId,
      itemId: item.itemId,
      type: "IN",
      quantity: item.quantity,
      note: "Purchase Order",
    });
  }

  return order;
};

export const getPurchaseOrders = async (tenantId: string) => {
  return repo.getPurchaseOrders(tenantId);
};

export const getPurchaseOrder = async (id: string, tenantId: string) => {
  return repo.getPurchaseOrder(id, tenantId);
};

export const getCompanyDetails = async (tenantId: string) => {
  return Tenant.findById(tenantId);
};
