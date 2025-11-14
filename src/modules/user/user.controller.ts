/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { User } from "./user.model";
import { AuthRequest } from "./user.interface";
import AppError from "../../errorHelper/AppError";
import {sendResponse} from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import Wallet from "../wallet/wallet.model";
import catchAsync from "../../utils/catchAsync";


export const updateUserProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, email, avatar } = req.body;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized request");
  }

  const updateData: any = {};
  if (name && name.trim() !== "") updateData.name = name.trim();
  if (email && email.trim() !== "") updateData.email = email.trim();
  if (avatar) updateData.avatar = avatar;

  if (Object.keys(updateData).length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "No valid fields provided to update");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: { user: updatedUser },
  });
});



export const searchUserByName = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name || (name as string).trim() === "") {
    throw new AppError(httpStatus.BAD_REQUEST, "Name query is required");
  }

  const users = await User.find({
    name: { $regex: (name as string).trim(), $options: "i" },
  }).limit(10);

  if (!users || users.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "No users found",
      data: { users: [] },
    });
  }

  const result = await Promise.all(
    users.map(async (user) => {
      const wallet = await Wallet.findOne({ userId: user._id });
      if (!wallet) return null;
      return {
        id: user._id,
        name: user.name,
        walletId: wallet._id,
      };
    })
  );

  const filteredResult = result.filter(Boolean);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message:
      filteredResult.length > 0
        ? "Users found"
        : "No users found with wallet",
    data: { users: filteredResult },
  });
});
