import { Router } from "express";
import { UserRoutes } from "../user/user.routes";
import { AuthRoutes } from "../auth/auth.routes";
import { transactionRoutes } from "../transaction/transaction.routes";
import { walletRoutes } from "../wallet/wallet.routes";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/transaction",
    route: transactionRoutes,
  },
  {
    path: "/wallet",
    route: walletRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
