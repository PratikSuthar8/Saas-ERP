import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as repo from "./auth.repository";

export const register = async (payload: any) => {
  const { companyName, email, password, name } = payload;
  const existing = await repo.findUserByEmail(email);
  if (existing) throw new Error("User already exists");
  const tenant = await repo.createTenant(companyName);
  const hashed = await bcrypt.hash(password, 10);
  const user = await repo.createUser({
    email,
    name: name || "",
    password: hashed,
    tenantId: tenant._id,
    roles: ["ADMIN"],
    provider: "local",
    mustChangePassword: false,
  });
  return generateToken(user);
};

export const login = async (payload: any) => {
  const { email, password } = payload;
  const user = await repo.findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");
  
  const token = generateToken(user);
  
  return {
    token,
    mustChangePassword: user.mustChangePassword || false,
  };
};

export const forgotPassword = async (email: string) => {
  const user = await repo.findUserByEmail(email);
  if (!user) {
    // Don't reveal that email doesn't exist for security
    return { message: "If your email is registered, you will receive a reset link" };
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  
  await repo.setResetToken(user._id, resetToken, resetTokenExpiry);
  
  // Return token (in production, you'd send this via email)
  return {
    message: "Password reset token generated",
    resetToken, // In production, DON'T return this in response - send via email
  };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await repo.findByResetToken(token);
  if (!user) throw new Error("Invalid or expired reset token");
  
  const hashed = await bcrypt.hash(newPassword, 10);
  await repo.updatePassword(user._id, hashed);
  await repo.clearResetToken(user._id);
  
  return { message: "Password reset successful" };
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await repo.findUserById(userId);
  if (!user) throw new Error("User not found");
  
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");
  
  const hashed = await bcrypt.hash(newPassword, 10);
  await repo.updatePassword(userId, hashed);
  
  return { success: true };
};

export const createUser = async (payload: any, tenantId: string, createdBy: string) => {
  const { email, roles, name } = payload;
  
  const existing = await repo.findUserByEmailAndTenant(email, tenantId);
  if (existing) throw new Error("User already exists in your organization");
  
  const tempPassword = Math.random().toString(36).slice(-10);
  const hashed = await bcrypt.hash(tempPassword, 10);
  
  const user = await repo.createUser({
    email,
    name: name || "",
    password: hashed,
    tenantId,
    roles,
    provider: "local",
    mustChangePassword: true,
  });
  
  return {
    email,
    roles,
    temporaryPassword: tempPassword,
  };
};

export const inviteUser = async (email: string, roles: string[], tenantId: string) => {
  return createUser({ email, roles }, tenantId, "admin");
};

const generateToken = (user: any) => {
  return jwt.sign(
    {
      userId: user._id,
      tenantId: user.tenantId,
      roles: user.roles,
      mustChangePassword: user.mustChangePassword || false,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );
};
