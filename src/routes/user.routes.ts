import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getMe, updateTimezone } from "../controllers/user.controller.js";
// import { validate } from "../middlewares/validator.js";
// import { updateTimezoneSchema } from "../validators/user.validator.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
// router.patch(
//   "/timezone",
//   authMiddleware,
//   validate(updateTimezoneSchema),
//   updateTimezone,
// );

export default router;
