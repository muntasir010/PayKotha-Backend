import httpStatus from "http-status-codes";
import type { Response } from "express";
import { Transaction } from "./transaction.model";
import { sendResponse } from "../../utils/sendResponse";
import { AuthRequest } from "./transaction.interface";

export const getTransactionHistory = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user?.id;

  const page = Number.parseInt(req.query.page as string) || 1;

  const limit = Number.parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find({
    $or: [
      { initiatedBy: userId },
      { fromWallet: { $exists: true } },
      { toWallet: { $exists: true } },
    ],
  })
    .populate("fromWallet", "userId")
    .populate("toWallet", "userId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments({
    $or: [
      { initiatedBy: userId },
      { fromWallet: { $exists: true } },
      { toWallet: { $exists: true } },
    ],
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Transaction history retrieved successfully",
    data: {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

export const getCommissionHistory = async (req: AuthRequest, res: Response) => {
  const agentId = req.user?.id;
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find({
    initiatedBy: agentId,
    type: { $in: ["cash_in", "cash_out"] },
    commission: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments({
    initiatedBy: agentId,
    type: { $in: ["cash_in", "cash_out"] },
    commission: { $gt: 0 },
  });

  const totalCommission = await Transaction.aggregate([
    {
      $match: {
        initiatedBy: agentId,
        type: { $in: ["cash_in", "cash_out"] },
        commission: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        totalCommission: { $sum: "$commission" },
      },
    },
  ]);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Commission history retrieved successfully",
    data: {
      transactions,
      totalCommission: totalCommission[0]?.totalCommission || 0,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
};
