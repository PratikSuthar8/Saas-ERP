import { Sale } from "../../db/models/Sale";

export const createSale = async (data: any) => {
  return Sale.create(data);
};

export const getSales = async (tenantId: string) => {
  return Sale.find({ tenantId })
    .populate('items.itemId', 'name sku sellingPrice')
    .sort({ createdAt: -1 });
};

export const getSale = async (id: string, tenantId: string) => {
  return Sale.findOne({ _id: id, tenantId })
    .populate('items.itemId', 'name sku sellingPrice');
};

export const updateSaleStatus = async (id: string, status: string, tenantId: string) => {
  return Sale.findOneAndUpdate(
    { _id: id, tenantId },
    { status },
    { returnDocument: 'after' }
  );
};
