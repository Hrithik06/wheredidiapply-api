import { Response } from "express";
import { getSafeUserById, updateUser } from "../services/user.service.js";
import { AuthRequest } from "../types/request.js";

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await getSafeUserById(req.user.userId);
  //NOTE:Don't send all data
  res.json(user);
};

// export const updateTimezone = async (req: AuthRequest, res: Response) => {
//   const userId = req.user.userId;
//   const { timezone } = req.body;

//   const updatedUser = await updateUser(userId, {
//     timezone,
//   });

//   return res.status(200).json(updatedUser);
// };
