import * as repo from "./inventory.repository";

export const createItem = async (payload: any, tenantId: string) => {
  return repo.createItem({
    ...payload,
    tenantId,
  });
};

export const getItems = async (tenantId: string) => {
  return repo.getItemsByTenant(tenantId);
};

export const updateItem = async (id: string, payload: any, tenantId: string) => {
  return repo.updateItem(id, payload, tenantId);
};

export const deleteItem = async (id: string, tenantId: string) => {
  return repo.deleteItem(id, tenantId);
};

export const adjustStock = async (payload: any, tenantId: string) => {
  const { itemId, type, quantity, note } = payload;
  const change = type === "IN" ? quantity : -quantity;
  const updatedItem = await repo.updateItemQuantity(itemId, change);
  await repo.createTransaction({
    tenantId,
    itemId,
    type,
    quantity,
    note,
  });
  return updatedItem;
};

export const getTransactions = async (itemId: string, tenantId: string) => {
  return repo.getTransactionsByItem(itemId, tenantId);
};
