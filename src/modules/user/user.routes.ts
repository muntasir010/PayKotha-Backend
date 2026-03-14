import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { UserController } from "./user.controller";

const router = Router();

router.get("/search", checkAuth(Role.USER,Role.AGENT, Role.ADMIN), UserController.searchUserByName);
router.put("/update", checkAuth(Role.USER,Role.AGENT, Role.ADMIN), UserController.updateUser);

export const UserRoutes = router;