import { Router } from "express";
import { register, login, getProfile, logout, } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get(
  "/profile",
  checkAuth(Role.USER, Role.AGENT, Role.ADMIN),
  getProfile
);
export const AuthRoutes = router;
