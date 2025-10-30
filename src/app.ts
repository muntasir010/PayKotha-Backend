import express, { Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import NotFound from "./app/middlewares/notFound";

const app = express();

app.use(express.json());
app.use(cors());


app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to PayKotha Backend System",
  });
});

app.use(globalErrorHandler);

app.use(NotFound);

export default app;
