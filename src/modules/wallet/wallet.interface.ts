export interface IWallet extends Document {
  _id: string
  userId: string
  balance: number
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
}



