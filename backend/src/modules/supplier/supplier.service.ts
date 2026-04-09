import * as repo from "./supplier.repository";

export const createSupplier = async (payload: any, tenantId: string) => {
  return repo.createSupplier({
    ...payload,
    tenantId,
  });
};

export const getSuppliers = async (tenantId: string) => {
  return repo.getSuppliersByTenant(tenantId);
};

export const updateSupplier = async (id: string, payload: any, tenantId: string) => {
  return repo.updateSupplier(id, payload, tenantId);
};

export const deleteSupplier = async (id: string, tenantId: string) => {
  return repo.deleteSupplier(id, tenantId);
};
