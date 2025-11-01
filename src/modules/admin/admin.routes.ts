import { Router } from "express";
import {
  getAllUsers,
  getAllWallets,
  getAllTransactions,
  blockWallet,
  unblockWallet,
  approveAgent,
  suspendAgent,
  getOverview,
  blockUser,
  unblockUser,
} from "./admin.controllers";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import express from "express";

const router = Router();

router.get(
  "/overview",
  checkAuth(Role.ADMIN),
  getOverview as unknown as express.RequestHandler
);
router.get(
  "/wallet",
  checkAuth(Role.ADMIN),
  getAllWallets as unknown as express.RequestHandler
);
router.get(
  "/transaction",
  checkAuth(Role.ADMIN),
  getAllTransactions as unknown as express.RequestHandler
);

router.patch(
  "/wallet/:walletId/block",
  checkAuth(Role.ADMIN),
  blockWallet as unknown as express.RequestHandler
);
router.patch(
  "/wallet/:walletId/unblock",
  checkAuth(Role.ADMIN),
  unblockWallet as unknown as express.RequestHandler
);

router.get(
  "/user",
  checkAuth(Role.ADMIN),
  getAllUsers as unknown as express.RequestHandler
);
router.patch(
  "/users/:userId/block",
  checkAuth(Role.ADMIN),
  blockUser as unknown as express.RequestHandler
);
router.patch(
  "/user/:userId/unblock",
  checkAuth(Role.ADMIN),
  unblockUser as unknown as express.RequestHandler
);

router.patch(
  "/agent/:userId/approve",
  checkAuth(Role.ADMIN),
  approveAgent as unknown as express.RequestHandler
);
router.patch(
  "/agent/:userId/suspend",
  checkAuth(Role.ADMIN),
  suspendAgent as unknown as express.RequestHandler
);

export const adminRoutes = router;
