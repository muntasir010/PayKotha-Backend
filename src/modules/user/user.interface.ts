import { Types } from "mongoose";

export enum Role {
  USER = "USER",
  AGENT="AGENT",
  ADMIN = "ADMIN"
}

export interface IAuthProviders {
  provider: "google" | "credential";
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email?: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;
  role: Role;
  auths: IAuthProviders[];
  bookings?: Types.ObjectId[];
  guides?: Types.ObjectId[];
  wallet?: Types.ObjectId;
}