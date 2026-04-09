import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as repo from "./auth.repository";

export const register = async (payload: any) => {
  const { companyName, email, password } = payload;
  const existing = await repo.findUserByEmail(email);
  if (existing) throw new Error("User already exists");
  const tenant = await repo.createTenant(companyName);
  const hashed = await bcrypt.hash(password, 10);
  const user = await repo.createUser({
    email,
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
  
  // Return flag if user must change password
  return {
    token,
    mustChangePassword: user.mustChangePassword || false,
  };
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await repo.findUserById(userId);
  if (!user) throw new Error("User not found");
  
  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");
  
  // Hash new password
  const hashed = await bcrypt.hash(newPassword, 10);
  
  // Update password and clear mustChangePassword flag
  await repo.updatePassword(userId, hashed);
  
  return { success: true };
};

export const createUser = async (payload: any, tenantId: string, createdBy: string) => {
  const { email, roles } = payload;
  
  // Check if user exists in this tenant
  const existing = await repo.findUserByEmailAndTenant(email, tenantId);
  if (existing) throw new Error("User already exists in your organization");
  
  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-10);
  const hashed = await bcrypt.hash(tempPassword, 10);
  
  const user = await repo.createUser({
    email,
    password: hashed,
    tenantId,
    roles,
    provider: "local",
    mustChangePassword: true, // Force password change on first login
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
