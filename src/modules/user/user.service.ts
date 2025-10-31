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
    auths: [authProvider],
    password: hashedPassword,
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
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
    if (decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
    if (payload.isActive || payload.isVerified || payload.isDeleted) {
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
  }
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

export const UserService = {
  createUser,
  getAllUsers,
  updateUser,
};
