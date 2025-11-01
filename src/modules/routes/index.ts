import { Router } from "express";
import { UserRoutes } from "../user/user.routes";
import { AuthRoutes } from "../auth/auth.routes";
import { transactionRoutes } from "../transaction/transaction.routes";

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
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
