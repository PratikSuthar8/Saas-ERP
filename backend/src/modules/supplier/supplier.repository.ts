import { Supplier } from "../../db/models/Supplier";

export const createSupplier = async (data: any) => {
  return Supplier.create(data);
};

export const getSuppliersByTenant = async (tenantId: string) => {
  return Supplier.find({ tenantId });
};

export const updateSupplier = async (id: string, payload: any, tenantId: string) => {
  return Supplier.findOneAndUpdate(
    { _id: id, tenantId },
    payload,
    { returnDocument: 'after' }
  );
};

export const deleteSupplier = async (id: string, tenantId: string) => {
  return Supplier.findOneAndDelete({ _id: id, tenantId });
};
