import { model, Schema } from "mongoose";
import { IWallet } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 50,
    },
    walletStatus: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Wallet = model<IWallet>("Wallet", walletSchema);
export default Wallet;
