/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { enVars } from "../config/env";
import AppError from "../errorHelper/AppError";
import { handleZodError } from "../helpers/handleZodError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (enVars.NODE_ENV === "development") {
    console.log(err);
  }
  let statusCode = 500;
  let message = `Something Went Wrong ${err.message} !!.`;
  let errorSources: any = [];

  // Zod Error
  if (err.name === "ZodError") {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: enVars.NODE_ENV === "development" ? err : null,
    stack: enVars.NODE_ENV === "development" ? err.stack : null,
  });
};
