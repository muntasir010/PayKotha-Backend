import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { enVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelper/AppError";
import { Wallet } from "../wallet/wallet.model";

const createUser = async (payload: IUser) => {
  // Check if user already exists
  const isUserExist = await User.findOne({ email: payload.email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User with this email already exists");
  }

  // Password hashing is handled by the Mongoose Pre-save hook in your model, 
  // but if you want to do it manually here, ensure the hook doesn't double-hash.
  const user = await User.create(payload);

  // Automatically create a wallet for USER and AGENT roles
  if (user.role === Role.USER || user.role === Role.AGENT) {
    const wallet = await Wallet.create({ userId: user._id });
    await User.findByIdAndUpdate(user._id, { walletId: wallet._id });
  }

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  // Authorization: Only ADMIN can change sensitive fields
  const adminOnlyFields = ["role", "isActive", "isApproved", "isDeleted"];
  const isChangingAdminFields = adminOnlyFields.some((field) => field in payload);

  if (isChangingAdminFields && decodedToken.role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update sensitive status or roles"
    );
  }

  // Manual password hashing if password is being updated
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      Number(enVars.BCRYPT_SALT_ROUND)
    );
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

const searchUsersWithWallet = async (name: string) => {
  const users = await User.find({
    name: { $regex: name.trim(), $options: "i" },
  }).limit(10);

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

  return result.filter(Boolean);
};

const getAllUsers = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: { total: totalUsers },
  };
};

const getUserById = async (id: string): Promise<IUser | null> => {
  const user = await User.findById(id);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

export const UserService = {
  createUser,
  updateUser,
  searchUsersWithWallet,
  getUserById,
  getAllUsers,
};