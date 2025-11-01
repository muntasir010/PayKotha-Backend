import { IAuthProviders, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { enVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelper/AppError";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isUserExist = await User.findOne({ email });

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(enVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProviders = {
    provider: "credential",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });
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

  if (payload.role) {
    if (decodedToken.role !== Role.ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to change role"
      );
    }
  }

  if (payload.isActive || payload.isApproved || payload.isDeleted) {
    if (decodedToken.role !== Role.ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to change user status"
      );
    }
  }
  if (payload.isActive || payload.isApproved || payload.isDeleted) {
    if (
      decodedToken.isActive === Role.USER ||
      decodedToken.isActive === Role.AGENT
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      enVars.BCRYPT_SALT_ROUND
    );
  }

  const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  return newUpdateUser;
};

const getUserById = async (id: string): Promise<IUser | null> => {
  const user = await User.findById(id);
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const getAllUsers = async () => {
  const users = await User.find({});

  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

const deleteUser = async (id: string): Promise<void> => {
  const user = await User.findById(id);
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isDeleted = true;
  await user.save();
};

export const UserService = {
  createUser,
  getAllUsers,
  updateUser,
  getUserById,
  deleteUser,
};
