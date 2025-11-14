import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { enVars } from "../config/env";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelper/AppError";
import { verifyToken } from "../utils/jwt";
import { IsActive } from "../modules/user/user.interface";
import catchAsync from "../utils/catchAsync";

export const checkAuth = (...authRoles: string[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      throw new AppError(403, "No token received");
    }

    const verifiedToken = verifyToken(
      accessToken,
      enVars.JWT_ACCESS_SECRET
    ) as JwtPayload;

    const isUserExist = await User.findOne({ email: verifiedToken.email });
    if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exist");
    }

    if (
      isUserExist.isActive === IsActive.BLOCKED ||
      isUserExist.isActive === IsActive.INACTIVE
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `User is ${isUserExist.isActive}`
      );
    }

    if (isUserExist.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
    }

    if (authRoles.length && !authRoles.includes(verifiedToken.role)) {
      throw new AppError(403, "You are not permitted to view this route");
    }

    req.user = {
      id: verifiedToken.id,
      email: verifiedToken.email,
      role: verifiedToken.role,
    };

    next();
  });
