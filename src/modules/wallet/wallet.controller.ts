// import httpStatus from 'http-status-codes';
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import type { Response } from "express"
// import mongoose from "mongoose"
// import { Wallet } from "./wallet.model"
// import { Transaction } from "../transaction/transaction.model"
// import { User } from "../user/user.model"
// import { AuthRequest } from "../transaction/transaction.interface"
// import AppError from "../../errorHelper/AppError"
// import { sendResponse } from "../../utils/sendResponse"

// export const getWallet = async (req: AuthRequest, res: Response) => {
//     const wallet = await Wallet.findOne({ userId: req.user?.id })
//     if (!wallet) {
//       return (res, 404, "Wallet not found") //how to send error this line
//     }

//     // return sendResponse(res, 200, true, "Wallet retrieved successfully", {
//     //   wallet: {
//     //     id: wallet._id,
//     //     balance: wallet.balance,
//     //     isBlocked: wallet.isBlocked,
//     //   },
//     // })

//  sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Wallet retrieved successfully",
//         wallet: { //Object literal may only specify known properties, and 'wallet' does not exist in type 'TResponse<unknown>'.ts(2353)
// // (property) wallet: {
// //     id: string;
// //     balance: number;
// //     isBlocked: boolean;
// // }
//         id: wallet._id,
//         balance: wallet.balance,
//         isBlocked: wallet.isBlocked,
//       },
//       });
//   }

// export const addMoney = async (req: AuthRequest, res: Response) => {
//   const session = await mongoose.startSession()
//   session.startTransaction()

//     const { amount, description = "Add money to wallet" } = req.body
//     const userId = req.user!.id

//     // Find wallet
//     const wallet = await Wallet.findOne({ userId }).session(session)
//     if (!wallet) {
//       await session.abortTransaction()
//       return sendError(res, 404, "Wallet not found")
//     }

//     if (wallet.isBlocked) {
//       await session.abortTransaction()
//       return sendError(res, 403, "Wallet is blocked")
//     }

//     // Update wallet balance
//     wallet.balance += amount
//     await wallet.save({ session })

//     // Create transaction record
//     const transaction = new Transaction({
//       type: "add_money",
//       amount,
//       toWallet: wallet._id,
//       initiatedBy: userId,
//       status: "completed",
//       description,
//     })
//     await transaction.save({ session })

//     await session.commitTransaction()

//     return sendResponse(res, 200, true, "Money added successfully", {
//       wallet: {
//         id: wallet._id,
//         balance: wallet.balance,
//       },
//       transaction: {
//         id: transaction._id,
//         type: transaction.type,
//         amount: transaction.amount,
//         status: transaction.status,
//       },
//     })
// }

// export const withdraw = async (req: AuthRequest, res: Response) => {
//   const session = await mongoose.startSession()
//   session.startTransaction()

//   try {
//     const { amount, description = "Withdraw from wallet" } = req.body
//     const userId = req.user?.id

//     // Find wallet
//     const wallet = await Wallet.findOne({ userId }).session(session)
//     if (!wallet) {
//       await session.abortTransaction()
//       return sendError(res, 404, "Wallet not found")
//     }

//     if (wallet.isBlocked) {
//       await session.abortTransaction()
//       return sendError(res, 403, "Wallet is blocked")
//     }

//     if (wallet.balance < amount) {
//       await session.abortTransaction()
//       return sendError(res, 400, "Insufficient balance")
//     }

//     // Update wallet balance
//     wallet.balance -= amount
//     await wallet.save({ session })

//     // Create transaction record
//     const transaction = new Transaction({
//       type: "withdraw",
//       amount,
//       fromWallet: wallet._id,
//       initiatedBy: userId,
//       status: "completed",
//       description,
//     })
//     await transaction.save({ session })

//     await session.commitTransaction()

//     return sendResponse(res, 200, true, "Money withdrawn successfully", {
//       wallet: {
//         id: wallet._id,
//         balance: wallet.balance,
//       },
//       transaction: {
//         id: transaction._id,
//         type: transaction.type,
//         amount: transaction.amount,
//         status: transaction.status,
//       },
//     })
//   } catch (error: any) {
//     await session.abortTransaction()
//     return sendError(res, 500, "Failed to withdraw money", error.message)
//   } finally {
//     session.endSession()
//   }
// }

// export const sendMoney = async (req: AuthRequest, res: Response) => {
//   const session = await mongoose.startSession()
//   session.startTransaction()

//   try {
//     const { amount, toWallet: toWalletId, description = "Send money" } = req.body
//     const userId = req.user!.id

//     // Find sender wallet
//     const fromWallet = await Wallet.findOne({ userId }).session(session)
//     if (!fromWallet) {
//       await session.abortTransaction()
//       return sendError(res, 404, "Sender wallet not found")
//     }

//     if (fromWallet.isBlocked) {
//       await session.abortTransaction()
//       return sendError(res, 403, "Sender wallet is blocked")
//     }

//     // Find receiver wallet
//     const toWallet = await Wallet.findById(toWalletId).session(session)
//     if (!toWallet) {
//       await session.abortTransaction()
//       return sendError(res, 404, "Receiver wallet not found")
//     }

//     if (toWallet.isBlocked) {
//       await session.abortTransaction()
//       return sendError(res, 403, "Receiver wallet is blocked")
//     }

//     if (fromWallet._id.toString() === toWallet._id.toString()) {
//       await session.abortTransaction()
//       return sendError(res, 400, "Cannot send money to yourself")
//     }

//     if (fromWallet.balance < amount) {
//       await session.abortTransaction()
//       return sendError(res, 400, "Insufficient balance")
//     }

//     // Update balances
//     fromWallet.balance -= amount
//     toWallet.balance += amount

//     await fromWallet.save({ session })
//     await toWallet.save({ session })

//     // Create transaction record
//     const transaction = new Transaction({
//       type: "send_money",
//       amount,
//       fromWallet: fromWallet._id,
//       toWallet: toWallet._id,
//       initiatedBy: userId,
//       status: "completed",
//       description,
//     })
//     await transaction.save({ session })

//     await session.commitTransaction()

//     return sendResponse(res, 200, true, "Money sent successfully", {
//       transaction: {
//         id: transaction._id,
//         type: transaction.type,
//         amount: transaction.amount,
//         status: transaction.status,
//       },
//       fromWallet: {
//         id: fromWallet._id,
//         balance: fromWallet.balance,
//       },
//     })
//   } catch (error: any) {
//     await session.abortTransaction()
//     return sendError(res, 500, "Failed to send money", error.message)
//   } finally {
//     session.endSession()
//   }
// }

// // Agent functions
// export const cashIn = async (req: AuthRequest, res: Response) => {
//   const session = await mongoose.startSession()
//   session.startTransaction()

//   try {
//     const { userId, amount, description = "Cash in by agent" } = req.body
//     const agentId = req.user!.id

//     // Verify agent
//     const agent = await User.findById(agentId)
//     if (!agent || agent.role !== "agent" || !agent.isApproved) {
//       await session.abortTransaction()
//       return sendError(res, 403, "Unauthorized agent")
//     }

//     // Find user wallet
//     const userWallet = await Wallet.findOne({ userId }).session(session)
//     if (!userWallet) {
//       await session.abortTransaction()
//       return sendError(res, 404, "User wallet not found")
//     }

//     if (userWallet.isBlocked) {
//       await session.abortTransaction()
//       return sendError(res, 403, "User wallet is blocked")
//     }

//     // Calculate commission (1% for agents)
//     const commission = amount * 0.01

//     // Update user wallet
//     userWallet.balance += amount
//     await userWallet.save({ session })

//     // Update agent wallet with commission
//     const agentWallet = await Wallet.findOne({ userId: agentId }).session(session)
//     if (agentWallet) {
//       agentWallet.balance += commission
//       await agentWallet.save({ session })
//     }

//     // Create transaction record
//     const transaction = new Transaction({
//       type: "cash_in",
//       amount,
//       commission,
//       toWallet: userWallet._id,
//       initiatedBy: agentId,
//       status: "completed",
//       description,
//     })
//     await transaction.save({ session })

//     await session.commitTransaction()

//     return sendResponse(res, 200, true, "Cash in successful", {
//       transaction: {
//         id: transaction._id,
//         type: transaction.type,
//         amount: transaction.amount,
//         commission: transaction.commission,
//         status: transaction.status,
//       },
//     })
//   } catch (error: any) {
//     await session.abortTransaction()
//     return sendError(res, 500, "Cash in failed", error.message)
//   } finally {
//     session.endSession()
//   }
// }

// export const cashOut = async (req: AuthRequest, res: Response) => {
//   const session = await mongoose.startSession()
//   session.startTransaction()

//   try {
//     const { userId, amount, description = "Cash out by agent" } = req.body
//     const agentId = req.user!.id

//     // Verify agent
//     const agent = await User.findById(agentId)
//     if (!agent || agent.role !== "agent" || !agent.isApproved) {
//       await session.abortTransaction()
//       return sendError(res, 403, "Unauthorized agent")
//     }

//     // Find user wallet
//     const userWallet = await Wallet.findOne({ userId }).session(session)
//     if (!userWallet) {
//       await session.abortTransaction()
//       return sendError(res, 404, "User wallet not found")
//     }

//     if (userWallet.isBlocked) {
//       await session.abortTransaction()
//       return sendError(res, 403, "User wallet is blocked")
//     }

//     if (userWallet.balance < amount) {
//       await session.abortTransaction()
//       return sendError(res, 400, "Insufficient balance in user wallet")
//     }

//     // Calculate commission (1% for agents)
//     const commission = amount * 0.01

//     // Update user wallet
//     userWallet.balance -= amount
//     await userWallet.save({ session })

//     // Update agent wallet with commission
//     const agentWallet = await Wallet.findOne({ userId: agentId }).session(session)
//     if (agentWallet) {
//       agentWallet.balance += commission
//       await agentWallet.save({ session })
//     }

//     // Create transaction record
//     const transaction = new Transaction({
//       type: "cash_out",
//       amount,
//       commission,
//       fromWallet: userWallet._id,
//       initiatedBy: agentId,
//       status: "completed",
//       description,
//     })
//     await transaction.save({ session })

//     await session.commitTransaction()

//     return sendResponse(res, 200, true, "Cash out successful", {
//       transaction: {
//         id: transaction._id,
//         type: transaction.type,
//         amount: transaction.amount,
//         commission: transaction.commission,
//         status: transaction.status,
//       },
//     })
//   } catch (error: any) {
//     await session.abortTransaction()
//     return sendError(res, 500, "Cash out failed", error.message)
//   } finally {
//     session.endSession()
//   }
// }

// import httpStatus from "http-status-codes"
// import type { Response } from "express"
// import { AuthRequest } from "../transaction/transaction.interface"
// import { sendResponse } from "../../utils/sendResponse"
// import * as walletService from "./wallet.service"

// // 🔹 Get Wallet
// export const getWallet = async (req: AuthRequest, res: Response) => {
//   const result = await walletService.getWallet(req.user)
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Wallet retrieved successfully",
//     data: result,
//   })
// }

// // 🔹 Add Money
// export const addMoney = async (req: AuthRequest, res: Response) => {
//   const result = await walletService.addMoney(req.user, req.body)
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Money added successfully",
//     data: result,
//   })
// }

// // 🔹 Withdraw
// export const withdraw = async (req: AuthRequest, res: Response) => {
//   const result = await walletService.withdraw(req.user, req.body)
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Money withdrawn successfully",
//     data: result,
//   })
// }

// // 🔹 Send Money
// export const sendMoney = async (req: AuthRequest, res: Response) => {
//   const result = await walletService.sendMoney(req.user, req.body)
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Money sent successfully",
//     data: result,
//   })
// }

// // 🔹 Cash In (Agent)
// export const cashIn = async (req: AuthRequest, res: Response) => {
//   const result = await walletService.cashIn(req.user, req.body)
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Cash in successful",
//     data: result,
//   })
// }

// // 🔹 Cash Out (Agent)
// export const cashOut = async (req: AuthRequest, res: Response) => {
//   const result = await walletService.cashOut(req.user, req.body)
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Cash out successful",
//     data: result,
//   })
// }

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
