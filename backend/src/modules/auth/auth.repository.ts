import { User } from "../../db/models/User";
import { Tenant } from "../../db/models/Tenant";

export const createTenant = async (name: string) => {
  return Tenant.create({ name });
};

export const createUser = async (data: any) => {
  return User.create(data);
};

export const findUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

export const findUserById = async (id: string) => {
  return User.findById(id);
};

export const findUserByEmailAndTenant = async (email: string, tenantId: string) => {
  return User.findOne({ email, tenantId });
};

export const updatePassword = async (userId: string, hashedPassword: string) => {
  return User.findByIdAndUpdate(userId, {
    password: hashedPassword,
    mustChangePassword: false,
  });
};

export const setResetToken = async (userId: string, token: string, expiry: Date) => {
  return User.findByIdAndUpdate(userId, {
    resetPasswordToken: token,
    resetPasswordExpires: expiry,
  });
};

export const findByResetToken = async (token: string) => {
  return User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });
};

export const clearResetToken = async (userId: string) => {
  return User.findByIdAndUpdate(userId, {
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
};
