import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWallet extends Document {
  userId:           Types.ObjectId;  // owner or agent
  availableBalance: number;          // THB — can be withdrawn
  pendingBalance:   number;          // THB — in escrow, not yet released
  currency:         string;
  stripeAccountId?: string;          // connected Stripe account for withdrawals
  createdAt:        Date;
  updatedAt:        Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
      index:    true,
    },
    availableBalance: { type: Number, default: 0, min: 0 },
    pendingBalance:   { type: Number, default: 0, min: 0 },
    currency:         { type: String, default: "thb" },
    stripeAccountId:  { type: String, default: "" },
  },
  { timestamps: true }
);

const Wallet: Model<IWallet> =
  mongoose.models.Wallet ?? mongoose.model<IWallet>("Wallet", WalletSchema);

export default Wallet;
