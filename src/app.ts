import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import passport from "passport";
import "./config/passport";
import { router } from "./modules/routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import NotFound from "./middlewares/notFound";
import { enVars } from "./config/env";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [enVars.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);

app.use(
  expressSession({
    secret: enVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("trust proxy", 1);

// ✅ Routes
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to PayKotha Wallet",
  });
});

app.use(globalErrorHandler);
app.use(NotFound);

export default app;
