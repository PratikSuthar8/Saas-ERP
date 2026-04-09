import { Tenant } from "../../db/models/Tenant";

export const getTenantById = async (tenantId: string) => {
  return Tenant.findById(tenantId);
};

export const updateTenant = async (tenantId: string, data: any) => {
  return Tenant.findByIdAndUpdate(
    tenantId,
    { $set: data },
    { returnDocument: 'after' }
  );
};
