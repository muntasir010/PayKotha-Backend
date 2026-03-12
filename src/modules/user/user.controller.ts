import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createUser = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully",
      data: user,
    });
  }
);

const updateUser = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;
    const user = await UserService.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );

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
