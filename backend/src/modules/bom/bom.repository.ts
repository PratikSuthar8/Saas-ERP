import { BOM } from "../../db/models/BOM";

export const createBOM = async (data: any) => {
  return BOM.create(data);
};

export const getBOMs = async (tenantId: string) => {
  return BOM.find({ tenantId })
    .populate('productId', 'name sku')
    .populate('components.itemId', 'name sku');
};

export const getBOM = async (id: string, tenantId: string) => {
  return BOM.findOne({ _id: id, tenantId })
    .populate('productId', 'name sku')
    .populate('components.itemId', 'name sku');
};

export const updateBOM = async (id: string, data: any, tenantId: string) => {
  return BOM.findOneAndUpdate({ _id: id, tenantId }, data, { returnDocument: 'after' });
};

export const deleteBOM = async (id: string, tenantId: string) => {
  return BOM.findOneAndDelete({ _id: id, tenantId });
};
