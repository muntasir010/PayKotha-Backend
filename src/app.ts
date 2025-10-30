import express, { Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import NotFound from "./middlewares/notFound";
import { router } from "./modules/routes";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/", router)

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to PayKotha Backend System",
  });
});

app.use(globalErrorHandler);

app.use(NotFound);

export default app;
