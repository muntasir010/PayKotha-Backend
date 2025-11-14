/* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextFunction, Request, Response } from "express";

// type AsyncHandler = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => Promise<void>;

// export const catchAsync =
//   (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     Promise.resolve(fn(req, res, next)).catch((err: any) => {
//       next(err);
//     });
//   };
// src/utils/catchAsync.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

const catchAsync = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
};

export default catchAsync;
