/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Response } from "express";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { AuthRequest } from "../transaction/transaction.interface";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelper/AppError";
import { IsActive } from "../user/user.interface";

// 📊 Overview
export const getOverview = async (req: AuthRequest, res: Response) => {
  const totalUsers = await User.countDocuments({ role: { $ne: "ADMIN" } });
  const totalAgents = await User.countDocuments({ role: "AGENT" });
  const totalTransactions = await Transaction.countDocuments();

  const totalVolumeAgg = await Transaction.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalVolume = totalVolumeAgg[0]?.total || 0;

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Overview retrieved successfully",
    data: {
      totalUsers,
      totalAgents,
      totalTransactions,
      totalVolume,
    },
  });
};

// 👤 Manage Users (with search, filter, pagination)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = (req.query.search as string) || "";
  const status = req.query.status as string; 

  const filter: Record<string, any> = { role: { $ne: "ADMIN" } };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    const wallets = await Wallet.find({ isBlocked: status === "blocked" });
    filter._id = { $in: wallets.map((w) => w.userId) };
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

// 🚫 Block User
export const blockUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  user.isActive = IsActive.BLOCKED;
  await user.save();

  await Wallet.updateMany({ userId }, { isBlocked: true });

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User blocked successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    },
  });
};

// ✅ Unblock User
export const unblockUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  user.isActive = IsActive.ACTIVE;
  await user.save();

  await Wallet.updateMany({ userId }, { isBlocked: false });

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User unblocked successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    },
  });
};

// 👛 Manage Wallets (with search + filter)
export const getAllWallets = async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = (req.query.search as string) || "";
  const isBlocked = req.query.isBlocked as string;

  const filter: Record<string, any> = {};
  if (isBlocked) filter.isBlocked = isBlocked === "true";

  let wallets = await Wallet.find(filter)
    .populate("userId", "name email phone role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (search) {
    wallets = wallets.filter((w: any) =>
      [w.userId?.name, w.userId?.email, w.userId?.phone]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }

  const total = await Wallet.countDocuments(filter);

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Wallets retrieved successfully",
    data: {
      wallets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

// 💸 Transactions with advanced filters
export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { type, status, minAmount, maxAmount, startDate, endDate, search } = req.query;
  const filter: Record<string, any> = {};

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }

  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    });
    filter.$or = [
      { initiatedBy: { $in: users.map((u) => u._id) } },
      { "fromWallet.userId": { $in: users.map((u) => u._id) } },
      { "toWallet.userId": { $in: users.map((u) => u._id) } },
    ];
  }

  const transactions = await Transaction.find(filter)
    .populate("initiatedBy", "name email role")
    .populate({
      path: "fromWallet",
      populate: { path: "userId", select: "name email" },
    })
    .populate({
      path: "toWallet",
      populate: { path: "userId", select: "name email" },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(filter);

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Transactions retrieved successfully",
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

// 🚫 Block Wallet
export const blockWallet = async (req: AuthRequest, res: Response) => {
  const { walletId } = req.params;

  const wallet = await Wallet.findById(walletId);
  if (!wallet) throw new AppError(404, "Wallet not found");

  wallet.isBlocked = true;
  await wallet.save();

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Wallet blocked successfully",
    data: {
      wallet: {
        id: wallet._id,
        isBlocked: wallet.isBlocked,
      },
    },
  });
};

// ✅ Unblock Wallet
export const unblockWallet = async (req: AuthRequest, res: Response) => {
  const { walletId } = req.params;

  const wallet = await Wallet.findById(walletId);
  if (!wallet) throw new AppError(404, "Wallet not found");

  wallet.isBlocked = false;
  await wallet.save();

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Wallet unblocked successfully",
    data: {
      wallet: {
        id: wallet._id,
        isBlocked: wallet.isBlocked,
      },
    },
  });
};

// ✅ Approve Agent
export const approveAgent = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");
  if (user.role !== "AGENT") throw new AppError(400, "User is not an agent");

  user.isApproved = true;
  await user.save();

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agent approved successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    },
  });
};

// 🚫 Suspend Agent
export const suspendAgent = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");
  if (user.role !== "AGENT") throw new AppError(400, "User is not an agent");

  user.isApproved = false;
  await user.save();

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agent suspended successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    },
  });
};
