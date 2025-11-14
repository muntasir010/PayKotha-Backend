/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import httpStatus from "http-status-codes";
import { AuthRequest } from "../transaction/transaction.interface";
import { sendResponse } from "../../utils/sendResponse";
import {
  getWalletService,
  addMoneyService,
  withdrawService,
  sendMoneyService,
  cashInService,
  cashOutService,
} from "./wallet.service";
import AppError from "../../errorHelper/AppError";
import catchAsync from "../../utils/catchAsync";

// ✅ Get wallet
export const getWallet = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id ?? "";
  const wallet = await getWalletService(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wallet retrieved successfully",
    data: wallet,
  });
};

// ✅ Add money
export const addMoney = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found");
  }

  const { amount, description } = req.body || {};

  if (!amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount is required");
  }

  const result = await addMoneyService(userId, amount, description);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Money added successfully",
    data: result,
  });
});

// ✅ Withdraw money
export const withdraw = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id as string;
  const { amount, description } = req.body;

  const result = await withdrawService(userId, amount, description);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Money withdrawn successfully",
    data: result,
  });
};

// ✅ Send money
export const sendMoney = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id as string;
  const { amount, toWallet, description } = req.body;

  const result = await sendMoneyService(userId, toWallet, amount, description );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Money sent successfully",
    data: result,
  });
};

// ✅ Cash in (agent only)
export const cashIn = async (req: AuthRequest, res: Response) => {
  const agentId = req.user?.id as string;
  const { userId, amount, description } = req.body;

  const result = await cashInService(userId, amount, description, agentId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cash in successful",
    data: result,
  });
};

// ✅ Cash out (agent only)
export const cashOut = async (req: AuthRequest, res: Response) => {
  const agentId = req.user?.id as string;
  
  const { userId, amount, description:_description  } = req.body;
  console.log(req.body)
  

  const result = await cashOutService(userId, amount, _description, agentId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cash out successful",
    data: result,
  });
};


export const walletControllers = {
  getWallet,
  addMoney,
  withdraw,
  sendMoney,
  cashIn,
  cashOut,
};
