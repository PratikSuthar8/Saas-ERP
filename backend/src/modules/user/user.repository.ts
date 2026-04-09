import { User } from "../../db/models/User";

export const getUsersByTenant = async (tenantId: string) => {
  return User.find({ tenantId }).select("-password");
};

export const getUserById = async (id: string, tenantId: string) => {
  return User.findOne({ _id: id, tenantId }).select("-password");
};

export const updateUserRoles = async (id: string, roles: string[], tenantId: string) => {
  return User.findOneAndUpdate(
    { _id: id, tenantId },
    { roles },
    { returnDocument: 'after' }
  ).select("-password");
};

export const deleteUser = async (id: string, tenantId: string) => {
  return User.findOneAndDelete({ _id: id, tenantId });
};

export const getUserByEmail = async (email: string, tenantId: string) => {
  return User.findOne({ email, tenantId });
};
