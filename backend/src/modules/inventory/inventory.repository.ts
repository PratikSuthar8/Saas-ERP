import { Item } from "../../db/models/Item";
import { InventoryTransaction } from "../../db/models/InventoryTransaction";

export const createItem = async (data: any) => {
  return Item.create(data);
};

export const getItemsByTenant = async (tenantId: string) => {
  return Item.find({ tenantId });
};

export const updateItem = async (id: string, payload: any, tenantId: string) => {
  return Item.findOneAndUpdate(
    { _id: id, tenantId },
    payload,
    { returnDocument: 'after' }  // Fixed: replaced 'new: true' with 'returnDocument: "after"'
  );
};

export const deleteItem = async (id: string, tenantId: string) => {
  await InventoryTransaction.deleteMany({ itemId: id, tenantId });
  return Item.findOneAndDelete({ _id: id, tenantId });
};

export const updateItemQuantity = async (itemId: string, quantityChange: number) => {
  return Item.findByIdAndUpdate(
    itemId,
    { $inc: { quantity: quantityChange } },
    { returnDocument: 'after' }  // Fixed: replaced 'new: true' with 'returnDocument: "after"'
  );
};

export const createTransaction = async (data: any) => {
  return InventoryTransaction.create(data);
};

export const getTransactionsByItem = async (itemId: string, tenantId: string) => {
  return InventoryTransaction.find({
    itemId,
    tenantId,
  }).sort({ createdAt: -1 });
};
