
import { Request } from "express";


export interface ITransaction extends Document {
  _id: string
  type: "add_money" | "withdraw" | "send_money" | "cash_in" | "cash_out"
  amount: number
  fee: number
  commission: number
  fromWallet?: string
  toWallet?: string
  initiatedBy: string
  status: "pending" | "completed" | "failed" | "reversed"
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  id: string
  email: string
  role: "USER" | "AGENT" | "ADMIN"
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}