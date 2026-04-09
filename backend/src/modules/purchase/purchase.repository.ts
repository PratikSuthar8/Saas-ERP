import { PurchaseOrder } from "../../db/models/PurchaseOrder";

export const createPurchaseOrder = async (data: any) => {
  return PurchaseOrder.create(data);
};

export const getPurchaseOrders = async (tenantId: string) => {
  return PurchaseOrder.find({ tenantId }).sort({ createdAt: -1 });
};
