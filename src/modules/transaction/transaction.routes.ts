import { Router } from "express";
import {
  getTransactionHistory,
  getCommissionHistory,
} from "./transaction.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.get("/history", checkAuth(Role.USER, Role.AGENT), getTransactionHistory);
router.get("/commission", checkAuth(Role.AGENT), getCommissionHistory);

export const transactionRoutes =  router;
