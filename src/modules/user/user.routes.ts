import { Router } from "express";
import { userControllers } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userControllers.createUser
);

router.get("/:id", checkAuth(Role.ADMIN), userControllers.getUserById);

router.get("/all-users", checkAuth(Role.ADMIN), userControllers.getAllUsers);

router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  userControllers.updateUser
);

router.delete(
  "/:id",
  checkAuth(Role.USER, Role.AGENT),
  userControllers.deleteUser
);

export const UserRoutes = router;
