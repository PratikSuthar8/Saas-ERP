import * as repo from "./user.repository";

export const getUsers = async (tenantId: string) => {
  return repo.getUsersByTenant(tenantId);
};

export const getCurrentUser = async (userId: string, tenantId: string) => {
  return repo.getUserById(userId, tenantId);
};

export const getUserWithPassword = async (userId: string, tenantId: string) => {
  return repo.getUserWithPassword(userId, tenantId);
};

export const updateUserRole = async (id: string, roles: string[], tenantId: string) => {
  return repo.updateUserRoles(id, roles, tenantId);
};

export const deleteUser = async (id: string, tenantId: string) => {
  return repo.deleteUser(id, tenantId);
};

export const updateProfile = async (userId: string, tenantId: string, data: any) => {
  return repo.updateProfile(userId, tenantId, data);
};

export const updatePassword = async (userId: string, tenantId: string, hashedPassword: string) => {
  return repo.updatePassword(userId, tenantId, hashedPassword);
};
