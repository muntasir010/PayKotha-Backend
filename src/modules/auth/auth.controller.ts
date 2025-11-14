import httpStatus from "http-status-codes";
import type { Request, Response } from "express";
import { User } from "../user/user.model";
import AppError from "../../errorHelper/AppError";
import Wallet from "../wallet/wallet.model";
import { sendResponse } from "../../utils/sendResponse";
import { generateToken } from "../../utils/jwt";
import { enVars } from "../../config/env";
import { AuthRequest } from "../user/user.interface";
import catchAsync from "../../utils/catchAsync";

export const register = async (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body;

  // Create user
  const user = new User({ name, email, phone, password, role });
  await user.save();

  // Create wallet for user/agent
  if (role === "USER" || role === "AGENT") {
    const wallet = new Wallet({ userId: user._id });
    await wallet.save();
  }

  // Generate JWT token
  const token = generateToken(
    { id: user._id, role: user.role },
    enVars.JWT_ACCESS_SECRET,
    enVars.JWT_ACCESS_EXPIRES
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isApproved: user.isApproved,
      },
      token,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Account is deactivated");
  }

  // Check if agent is approved
  if (user.role === "AGENT" && !user.isApproved) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Agent account is not approved yet"
    );
  }

  const token = generateToken(
    { id: user._id.toString(), email: user.email, role: user.role },
    enVars.JWT_ACCESS_SECRET,
    enVars.JWT_ACCESS_EXPIRES
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Login Successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isApproved: user.isApproved,
      },
      token,
    },
  });
};

export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logout successful",
    data: {
      data: null,
    },
  });
});


export const getProfile = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    let wallet = null;
    if (user.role !== "ADMIN") {
      wallet = await Wallet.findOne({ userId: user._id });
    }

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile retrieved successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          isApproved: user.isApproved,
          profileImg: user.profileImg || null, 
        },
        wallet: wallet
          ? {
              id: wallet._id,
              balance: wallet.balance,
              isBlocked: wallet.isBlocked,
            }
          : null,
      },
    });
  }
);
