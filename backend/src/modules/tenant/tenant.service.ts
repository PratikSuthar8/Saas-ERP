import * as repo from "./tenant.repository";

export const getTenant = async (tenantId: string) => {
  return repo.getTenantById(tenantId);
};

export const updateTenant = async (tenantId: string, data: any) => {
  return repo.updateTenant(tenantId, data);
};
