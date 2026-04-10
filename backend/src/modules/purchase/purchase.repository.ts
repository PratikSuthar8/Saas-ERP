import { PurchaseOrder } from "../../db/models/PurchaseOrder";

export const createPurchaseOrder = async (data: any) => {
  return PurchaseOrder.create(data);
};

export const getPurchaseOrders = async (tenantId: string) => {
  return PurchaseOrder.find({ tenantId })
    .populate('supplierId', 'name contactEmail phone address')
    .populate('items.itemId', 'name sku costPrice')
    .sort({ createdAt: -1 });
};

export const getPurchaseOrder = async (id: string, tenantId: string) => {
  return PurchaseOrder.findOne({ _id: id, tenantId })
    .populate('supplierId', 'name contactEmail phone address')
    .populate('items.itemId', 'name sku costPrice');
};
