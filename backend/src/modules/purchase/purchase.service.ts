import * as repo from "./purchase.repository";
import { updateItemQuantity, createTransaction } from "../inventory/inventory.repository";

export const createPurchaseOrder = async (payload: any, tenantId: string) => {
  const { supplierId, items } = payload;

  // Create purchase order
  const order = await repo.createPurchaseOrder({
    tenantId,
    supplierId,
    items,
  });

  // Update inventory + create transactions
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
  const orders = await repo.getPurchaseOrders(tenantId);
  // Return orders with supplier info (frontend will match supplier names)
  return orders;
};
