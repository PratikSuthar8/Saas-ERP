import { Response } from "express";
import * as service from "./user.service";

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
