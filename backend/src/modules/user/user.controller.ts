import { Response } from "express";
import * as service from "./user.service";
import bcrypt from "bcryptjs";

export const getCurrentUser = async (req: any, res: Response) => {
  const user = await service.getCurrentUser(req.user.userId, req.tenantId);
  res.json({
    success: true,
    data: user,
  });
};

export const getUsers = async (req: any, res: Response) => {
  const users = await service.getUsers(req.tenantId);
  res.json({
    success: true,
    data: users,
  });
};

export const updateUserRole = async (req: any, res: Response) => {
  const { id } = req.params;
  const { roles } = req.body;
  const user = await service.updateUserRole(id, roles, req.tenantId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.json({
    success: true,
    data: user,
  });
};

export const deleteUser = async (req: any, res: Response) => {
  const { id } = req.params;
  await service.deleteUser(id, req.tenantId);
  res.json({
    success: true,
    message: "User deleted successfully",
  });
};

export const updateProfile = async (req: any, res: Response) => {
  const { name, email } = req.body;
  const user = await service.updateProfile(req.user.userId, req.tenantId, { name, email });
  res.json({
    success: true,
    data: user,
  });
};

export const changePassword = async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  
  // Get user with password
  const user = await service.getUserWithPassword(req.user.userId, req.tenantId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  
  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update password
  await service.updatePassword(req.user.userId, req.tenantId, hashedPassword);
  
  res.json({
    success: true,
    message: "Password changed successfully",
  });
};
