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
export const addMoney = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { amount, description } = req.body;

  const result = await addMoneyService(amount, description, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Money added successfully",
    data: result,
  });
};

// ✅ Withdraw money
export const withdraw = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { amount, description } = req.body;

  const result = await withdrawService(amount, description, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Money withdrawn successfully",
    data: result,
  });
};

// ✅ Send money
export const sendMoney = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { amount, toWallet, description } = req.body;

  const result = await sendMoneyService(amount, description, toWallet, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Money sent successfully",
    data: result,
  });
};

// ✅ Cash in (agent only)
export const cashIn = async (req: AuthRequest, res: Response) => {
  const agentId = req.user?.id;
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
  const agentId = req.user?.id;
  const { userId, amount, description } = req.body;

  const result = await cashOutService(userId, amount, description, agentId);

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
