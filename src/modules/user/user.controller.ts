/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelper/AppError";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Registered Successfully",
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any).id; 
  const verifiedToken = req.user as JwtPayload;
  const payload = req.body;

  const result = await UserService.updateUser(userId, payload, verifiedToken);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User update failed or user not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Profile Updated Successfully",
    data: result,
  });
});

const searchUserByName = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name || (name as string).trim() === "") {
    throw new AppError(httpStatus.BAD_REQUEST, "User name is required for search");
  }

  const result = await UserService.searchUsersWithWallet(name as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.length > 0 ? "Users found successfully" : "No users matched your search",
    data: { users: result },
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All users retrieved successfully",
    data: result,
  });
});

export const UserController = {
  createUser,
  updateUser,
  searchUserByName,
  getAllUsers,
};