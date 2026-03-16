import express from "express";
import { AIControllers } from "./ai.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

router.post(
  "/chat",
  checkAuth(Role.USER, Role.AGENT, Role.ADMIN),
  AIControllers.getChatResponse
);

export const AIRoutes = router;