import { Request, Response } from "express";
import * as service from "./auth.service";

export const register = async (req: Request, res: Response) => {
  const token = await service.register(req.body);
  res.json({
    success: true,
    data: { token },
  });
};

export const login = async (req: Request, res: Response) => {
  const result = await service.login(req.body);
  res.json({
    success: true,
    data: result,
  });
};

export const changePassword = async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  await service.changePassword(req.user.userId, oldPassword, newPassword);
  res.json({
    success: true,
    message: "Password changed successfully",
  });
};

export const createUser = async (req: any, res: Response) => {
  const result = await service.createUser(req.body, req.tenantId, req.user.userId);
  res.json({
    success: true,
    data: result,
  });
};

export const inviteUser = async (req: any, res: Response) => {
  const { email, roles } = req.body;
  const result = await service.inviteUser(email, roles, req.tenantId);
  res.json({
    success: true,
    data: result,
  });
};
