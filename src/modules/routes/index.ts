import { Router } from "express";
import { AuthRoutes } from "../auth/auth.routes";
import { transactionRoutes } from "../transaction/transaction.routes";
import { walletRoutes } from "../wallet/wallet.routes";
import { adminRoutes } from "../admin/admin.routes";
import { UserRoutes } from "../user/user.routes";
import { messageRoutes } from "../message/message.routes";
import { AIRoutes } from "../ai/ai.routes";

export const router = Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/transactions",
    route: transactionRoutes,
  },
  {
    path: "/wallet",
    route: walletRoutes,
  },
  { 
    path: "/contact", 
    route: messageRoutes 
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
  {
    path: "/ai",
    route: AIRoutes
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
