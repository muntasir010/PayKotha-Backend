import { Router } from "express";
import { searchUserByName, updateUserProfile, } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.get("/search", checkAuth(Role.USER,Role.AGENT, Role.ADMIN), searchUserByName);
router.put("/update", checkAuth(Role.USER,Role.AGENT, Role.ADMIN), updateUserProfile);

export const UserRoutes = router;