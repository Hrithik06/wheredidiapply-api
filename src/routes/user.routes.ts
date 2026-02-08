import { Router } from "express";
import { findOrCreateUser, getAllUsers } from "../services/user.service.js";

const router = Router();

/*
  Temporary login endpoint.
  Later Google OAuth will call this internally.
*/
router.post("/login", async (req, res) => {
  const user = await findOrCreateUser(req.body);
  res.json(user);
});

router.get("/", async (_, res) => {
  const users = await getAllUsers();
  res.json(users);
});

export default router;
