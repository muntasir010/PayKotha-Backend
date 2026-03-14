/* eslint-disable @typescript-eslint/no-explicit-any */

export enum Role {
  USER = "USER",
  AGENT = "AGENT",
  ADMIN = "ADMIN",
}

export enum IsActive{
  ACTIVE="ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED"
}
export interface IAuthProvider {
    provider: "google" | "credentials";  // "Google", "Credential"
    providerId: string;
}

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  phone: string
  profileImg?: string
  password: string
  role: Role
  isActive: IsActive
  auths?: IAuthProvider[]
  isApproved: boolean // agent
  createdAt: Date
  updatedAt: Date
    comparePassword(candidatePassword: string): Promise<boolean>
}

// src/modules/user/user.interface.ts
import { Request } from "express";

export interface AuthUser {
  id: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  body: {
     id: string;
    name?: string;
    email?: string;
    avatar?: string;
    [key: string]: any; 
  };
}
