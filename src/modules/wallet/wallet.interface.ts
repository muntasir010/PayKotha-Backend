import { Types } from "mongoose"

export interface IWallet extends Document {
    userId: Types.ObjectId;
    balance: number;
    walletStatus: 'active' | 'blocked';
    isBlocked: boolean;
}
