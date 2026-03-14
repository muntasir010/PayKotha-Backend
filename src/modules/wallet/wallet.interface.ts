export interface IWallet extends Document {
  _id: string
  userId: string
  balance: number
  walletStatus: WalletStatus
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
}


export enum WalletStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  SUSPENDED = "SUSPENDED",
}
