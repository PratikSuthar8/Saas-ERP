import * as repo from "./bom.repository";

export const createBOM = async (data: any, tenantId: string) => {
  return repo.createBOM({ ...data, tenantId });
};

export const getBOMs = async (tenantId: string) => {
  return repo.getBOMs(tenantId);
};

export const getBOM = async (id: string, tenantId: string) => {
  return repo.getBOM(id, tenantId);
};

export const updateBOM = async (id: string, data: any, tenantId: string) => {
  return repo.updateBOM(id, data, tenantId);
};

export const deleteBOM = async (id: string, tenantId: string) => {
  return repo.deleteBOM(id, tenantId);
};
