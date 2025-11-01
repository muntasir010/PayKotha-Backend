import express, { Router } from "express";
import {
  getTransactionHistory,
  getCommissionHistory,
} from "./transaction.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.get(
  "/history",
  checkAuth(Role.USER, Role.AGENT),
  getTransactionHistory as unknown as express.RequestHandler
);
router.get(
  "/commission",
  checkAuth(Role.AGENT),
  getCommissionHistory as unknown as express.RequestHandler
);

export const transactionRoutes = router;
