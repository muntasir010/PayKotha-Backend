// /* eslint-disable @typescript-eslint/no-explicit-any */
// import mongoose from "mongoose";
// import httpStatus from "http-status-codes";
// import AppError from "../../errorHelper/AppError";
// import { Wallet } from "./wallet.model";
// import { Transaction } from "../transaction/transaction.model";
// import { User } from "../user/user.model";
// import { AuthUser } from "../transaction/transaction.interface";

// // 🔹 Get Wallet
// export const getWallet = async (user: AuthUser) => {
//   const wallet = await Wallet.findOne({ userId: user.id });
//   if (!wallet) throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");

//   return {
//     wallet: {
//       id: wallet._id,
//       balance: wallet.balance,
//       isBlocked: wallet.isBlocked,
//     },
//   };
// };

// // 🔹 Add Money
// export const addMoney = async (user: AuthUser, body: any) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   const { amount, description = "Add money to wallet" } = body;

//   const wallet = await Wallet.findOne({ userId: user.id }).session(session);
//   if (!wallet) throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
//   if (wallet.isBlocked)
//     throw new AppError(httpStatus.FORBIDDEN, "Wallet is blocked");

//   wallet.balance += amount;
//   await wallet.save({ session });

//   const transaction = await Transaction.create(
//     [
//       {
//         type: "add_money",
//         amount,
//         toWallet: wallet._id,
//         initiatedBy: user.id,
//         status: "completed",
//         description,
//       },
//     ],
//     { session }
//   );

//   await session.commitTransaction();
//   session.endSession();

//   return {
//     wallet: {
//       id: wallet._id,
//       balance: wallet.balance,
//     },
//     transaction: transaction[0],
//   };
// };

// // 🔹 Withdraw
// export const withdraw = async (user: AuthUser, body: any) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   const { amount, description = "Withdraw from wallet" } = body;

//   const wallet = await Wallet.findOne({ userId: user.id }).session(session);
//   if (!wallet) throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
//   if (wallet.isBlocked)
//     throw new AppError(httpStatus.FORBIDDEN, "Wallet is blocked");
//   if (wallet.balance < amount)
//     throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");

//   wallet.balance -= amount;
//   await wallet.save({ session });

//   const transaction = await Transaction.create(
//     [
//       {
//         type: "withdraw",
//         amount,
//         fromWallet: wallet._id,
//         initiatedBy: user.id,
//         status: "completed",
//         description,
//       },
//     ],
//     { session }
//   );

//   await session.commitTransaction();
//   session.endSession();

//   return {
//     wallet: {
//       id: wallet._id,
//       balance: wallet.balance,
//     },
//     transaction: transaction[0],
//   };
// };

// // 🔹 Send Money
// export const sendMoney = async (user: AuthUser, body: any) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   const { amount, toWallet: toWalletId, description = "Send money" } = body;

//   const fromWallet = await Wallet.findOne({ userId: user.id }).session(session);
//   if (!fromWallet)
//     throw new AppError(httpStatus.NOT_FOUND, "Sender wallet not found");
//   if (fromWallet.isBlocked)
//     throw new AppError(httpStatus.FORBIDDEN, "Sender wallet is blocked");

//   const toWallet = await Wallet.findById(toWalletId).session(session);
//   if (!toWallet)
//     throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found");
//   if (toWallet.isBlocked)
//     throw new AppError(httpStatus.FORBIDDEN, "Receiver wallet is blocked");
//   if (fromWallet._id.equals(toWallet._id))
//     throw new AppError(httpStatus.BAD_REQUEST, "Cannot send to yourself");
//   if (fromWallet.balance < amount)
//     throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");

//   fromWallet.balance -= amount;
//   toWallet.balance += amount;

//   await fromWallet.save({ session });
//   await toWallet.save({ session });

//   const transaction = await Transaction.create(
//     [
//       {
//         type: "send_money",
//         amount,
//         fromWallet: fromWallet._id,
//         toWallet: toWallet._id,
//         initiatedBy: user.id,
//         status: "completed",
//         description,
//       },
//     ],
//     { session }
//   );

//   await session.commitTransaction();
//   session.endSession();

//   return {
//     transaction: transaction[0],
//     fromWallet: {
//       id: fromWallet._id,
//       balance: fromWallet.balance,
//     },
//   };
// };

// // 🔹 Cash In
// export const cashIn = async (user: AuthUser, body: any) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   const { userId, amount, description = "Cash in by agent" } = body;
//   const agentId = user.id;

//   const agent = await User.findById(agentId);
//   if (!agent || agent.role !== "agent" || !agent.isApproved)
//     throw new AppError(httpStatus.FORBIDDEN, "Unauthorized agent");

//   const userWallet = await Wallet.findOne({ userId }).session(session);
//   if (!userWallet)
//     throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
//   if (userWallet.isBlocked)
//     throw new AppError(httpStatus.FORBIDDEN, "User wallet is blocked");

//   const commission = amount * 0.01;

//   userWallet.balance += amount;
//   await userWallet.save({ session });

//   const agentWallet = await Wallet.findOne({ userId: agentId }).session(
//     session
//   );
//   if (agentWallet) {
//     agentWallet.balance += commission;
//     await agentWallet.save({ session });
//   }

//   const transaction = await Transaction.create(
//     [
//       {
//         type: "cash_in",
//         amount,
//         commission,
//         toWallet: userWallet._id,
//         initiatedBy: agentId,
//         status: "completed",
//         description,
//       },
//     ],
//     { session }
//   );

//   await session.commitTransaction();
//   session.endSession();

//   return { transaction: transaction[0] };
// };

// // 🔹 Cash Out
// export const cashOut = async (user: AuthUser, body: any) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   const { userId, amount, description = "Cash out by agent" } = body;
//   const agentId = user.id;

//   const agent = await User.findById(agentId);
//   if (!agent || agent.role !== "agent" || !agent.isApproved)
//     throw new AppError( httpStatus.FORBIDDEN, "Unauthorized agent");

//   const userWallet = await Wallet.findOne({ userId }).session(session);
//   if (!userWallet)
//     throw new AppError( httpStatus.NOT_FOUND, "User wallet not found");
//   if (userWallet.isBlocked)
//     throw new AppError( httpStatus.FORBIDDEN, "User wallet is blocked");
//   if (userWallet.balance < amount)
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "Insufficient balance in user wallet"
//     );

//   const commission = amount * 0.01;

//   userWallet.balance -= amount;
//   await userWallet.save({ session });

//   const agentWallet = await Wallet.findOne({ userId: agentId }).session(
//     session
//   );
//   if (agentWallet) {
//     agentWallet.balance += commission;
//     await agentWallet.save({ session });
//   }

//   const transaction = await Transaction.create(
//     [
//       {
//         type: "cash_out",
//         amount,
//         commission,
//         fromWallet: userWallet._id,
//         initiatedBy: agentId,
//         status: "completed",
//         description,
//       },
//     ],
//     { session }
//   );

//   await session.commitTransaction();
//   session.endSession();

//   return { transaction: transaction[0] };
// };



import mongoose from "mongoose";
import httpStatus from "http-status-codes";
import { Wallet } from "./wallet.model";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import AppError from "../../errorHelper/AppError";

// ✅ Get Wallet
export const getWalletService = async (userId: string) => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");

  return {
    id: wallet._id,
    balance: wallet.balance,
    isBlocked: wallet.isBlocked,
  };
};

// ✅ Add Money
export const addMoneyService = async (
  userId: string,
  amount: number,
  description = "Add money to wallet"
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    if (wallet.isBlocked)
      throw new AppError(httpStatus.FORBIDDEN, "Wallet is blocked");

    wallet.balance += amount;
    await wallet.save({ session });

    const transaction = await Transaction.create(
      [
        {
          type: "add_money",
          amount,
          toWallet: wallet._id,
          initiatedBy: userId,
          status: "completed",
          description,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { wallet, transaction: transaction[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Withdraw Money
export const withdrawService = async (
  userId: string,
  amount: number,
  description = "Withdraw from wallet"
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    if (wallet.isBlocked)
      throw new AppError(httpStatus.FORBIDDEN, "Wallet is blocked");
    if (wallet.balance < amount)
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");

    wallet.balance -= amount;
    await wallet.save({ session });

    const transaction = await Transaction.create(
      [
        {
          type: "withdraw",
          amount,
          fromWallet: wallet._id,
          initiatedBy: userId,
          status: "completed",
          description,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { wallet, transaction: transaction[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Send Money
export const sendMoneyService = async (
  userId: string,
  toWalletId: string,
  amount: number,
  description = "Send money"
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fromWallet = await Wallet.findOne({ userId }).session(session);
    if (!fromWallet)
      throw new AppError(httpStatus.NOT_FOUND, "Sender wallet not found");
    if (fromWallet.isBlocked)
      throw new AppError(httpStatus.FORBIDDEN, "Sender wallet is blocked");

    const toWallet = await Wallet.findById(toWalletId).session(session);
    if (!toWallet)
      throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found");
    if (toWallet.isBlocked)
      throw new AppError(httpStatus.FORBIDDEN, "Receiver wallet is blocked");
    if (fromWallet._id.toString() === toWallet._id.toString())
      throw new AppError(httpStatus.BAD_REQUEST, "Cannot send money to yourself");
    if (fromWallet.balance < amount)
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");

    fromWallet.balance -= amount;
    toWallet.balance += amount;

    await fromWallet.save({ session });
    await toWallet.save({ session });

    const transaction = await Transaction.create(
      [
        {
          type: "send_money",
          amount,
          fromWallet: fromWallet._id,
          toWallet: toWallet._id,
          initiatedBy: userId,
          toWallet: toWallet._id,
          status: "completed",
          description,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { fromWallet, toWallet, transaction: transaction[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Cash In (Agent)
export const cashInService = async (
  agentId: string,
  userId: string,
  amount: number,
  description = "Cash in by agent"
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== "AGENT" || !agent.isApproved)
      throw new AppError(httpStatus.FORBIDDEN, "Unauthorized agent");

    const userWallet = await Wallet.findOne({ userId }).session(session);
    if (!userWallet)
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    if (userWallet.isBlocked)
      throw new AppError(httpStatus.FORBIDDEN, "User wallet is blocked");

    const commission = amount * 0.01;

    userWallet.balance += amount;
    await userWallet.save({ session });

    const agentWallet = await Wallet.findOne({ userId: agentId }).session(session);
    if (agentWallet) {
      agentWallet.balance += commission;
      await agentWallet.save({ session });
    }

    const transaction = await Transaction.create(
      [
        {
          type: "cash_in",
          amount,
          commission,
          toWallet: userWallet._id,
          initiatedBy: agentId,
          status: "completed",
          description,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { userWallet, transaction: transaction[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Cash Out (Agent)
export const cashOutService = async (
  agentId: string,
  userId: string,
  amount: number,
  description = "Cash out by agent"
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== "AGENT" || !agent.isApproved)
      throw new AppError(httpStatus.FORBIDDEN, "Unauthorized agent");

    const userWallet = await Wallet.findOne({ userId }).session(session);
    if (!userWallet)
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    if (userWallet.isBlocked)
      throw new AppError(httpStatus.FORBIDDEN, "User wallet is blocked");
    if (userWallet.balance < amount)
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient user balance");

    const commission = amount * 0.01;

    userWallet.balance -= amount;
    await userWallet.save({ session });

    const agentWallet = await Wallet.findOne({ userId: agentId }).session(session);
    if (agentWallet) {
      agentWallet.balance += commission;
      await agentWallet.save({ session });
    }

    const transaction = await Transaction.create(
      [
        {
          type: "cash_out",
          amount,
          commission,
          fromWallet: userWallet._id,
          initiatedBy: agentId,
          status: "completed",
          description,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { userWallet, transaction: transaction[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
