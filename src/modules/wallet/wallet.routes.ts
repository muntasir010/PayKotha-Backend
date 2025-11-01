import { Router } from "express";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { walletControllers } from "./wallet.controller";
import express from "express";

const router = Router();

// User routes
router.get(
  "/",
  checkAuth(Role.USER, Role.AGENT),
  walletControllers.getWallet as unknown as express.RequestHandler
);

router.get(
  "/",
  checkAuth(Role.USER, Role.AGENT),
  walletControllers.getWallet as unknown as express.RequestHandler
);
router.post(
  "/add-money",
  checkAuth(Role.USER),
  walletControllers.addMoney as unknown as express.RequestHandler
);
router.post(
  "/withdraw",
  checkAuth(Role.USER),
  walletControllers.withdraw as unknown as express.RequestHandler
);
router.post(
  "/send-money",
  checkAuth(Role.USER),
  walletControllers.sendMoney as unknown as express.RequestHandler
);

// Agent routes
router.post(
  "/cash-in",
  checkAuth(Role.AGENT),
  walletControllers.cashIn as unknown as express.RequestHandler
);
router.post(
  "/cash-out",
  checkAuth(Role.AGENT),
  walletControllers.cashOut as unknown as express.RequestHandler
);

export const walletRoutes = router;
