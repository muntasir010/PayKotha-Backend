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
  isActive: IsActive;
  isApproved?: boolean;
  role: Role;
  auths: IAuthProviders[];
  wallet?: Types.ObjectId;
}
import { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
