/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JwtPayload } from 'jsonwebtoken';
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { enVars } from '../../config/env';
import { createNewAccessTokenWithRefreshToken } from '../../utils/userToken';
import AppError from '../../errorHelper/AppError';

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

  const user = await User.findById(decodedToken.userId);
  const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string);
  
  if(!isOldPasswordMatch){
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password Doesn't Match")
  };

  user!.password = await bcryptjs.hash(newPassword, Number(enVars.BCRYPT_SALT_ROUND)); 
  user!.save();
};

export const AuthService = {
  getNewAccessToken,
  resetPassword,
};
