import { Response } from "express";
import { getSafeUserById, updateUser } from "../services/user.service.js";
import { AuthRequest } from "../types/request.js";

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await getSafeUserById(req.user.userId);
  //NOTE:Don't send all data
  res.json(user);
};

export const updateTimezone = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const { timezone } = req.body;
  const data = await updateUser(userId, { timezone });
  res.json(data);
};
