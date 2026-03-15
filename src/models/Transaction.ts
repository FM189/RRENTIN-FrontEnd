import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TransactionType =
  | "visit_payment"    // tenant pays visit fee
  | "rent_payment"     // tenant pays rent (first month or recurring)
  | "monthly_fee"      // tenant pays custom property fees (pass-through to owner)
  | "agent_payment"    // owner pays agent for service
  | "contract_fee"     // one-time contract fee charged to tenant or deducted from owner
  | "vat"              // VAT on contract fee or platform fee
  | "platform_fee"     // platform earns its % cut from rent
  | "stripe_fee"       // Stripe processing fee (recorded for accounting)
  | "owner_payout"     // net rent credited to owner wallet
  | "late_fee"         // 15% penalty for overdue rent
  | "damage_charge"    // security deposit capture for damage
  | "escrow_hold"      // funds held in escrow pending release
  | "escrow_release"   // escrow released to recipient
  | "refund"           // refund back to payer
  | "withdrawal";      // user withdraws balance to bank

export type TransactionStatus = "pending" | "completed" | "failed";

export type TransactionReferenceType =
  | "visit_request"
  | "rent_booking"
  | "agent_service";

export interface ITransaction extends Document {
  type:          TransactionType;
  userId:        Types.ObjectId | null; // null = platform earnings
  referenceId:   Types.ObjectId | null; // visit request / booking / agent service ID
  referenceType: TransactionReferenceType | null;
  propertyId:    Types.ObjectId | null;
  amount:        number;   // THB, always positive
  currency:      string;
  stripeRef:     string;   // PI / transfer / refund / payout ID
  status:        TransactionStatus;
  description:   string;
  createdAt:     Date;
  updatedAt:     Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: {
      type:     String,
      enum:     ["visit_payment", "rent_payment", "monthly_fee", "agent_payment", "contract_fee", "vat", "platform_fee", "stripe_fee", "owner_payout", "late_fee", "damage_charge", "escrow_hold", "escrow_release", "refund", "withdrawal"],
      required: true,
      index:    true,
    },
    userId:        { type: Schema.Types.ObjectId, ref: "User",    default: null, index: true },
    referenceId:   { type: Schema.Types.ObjectId,                 default: null, index: true },
    referenceType: {
      type:    String,
      enum:    ["visit_request", "rent_booking", "agent_service", null],
      default: null,
    },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", default: null },
    amount:     { type: Number, required: true },
    currency:   { type: String, default: "thb" },
    stripeRef:  { type: String, default: "" },
    status:     {
      type:    String,
      enum:    ["pending", "completed", "failed"],
      default: "pending",
      index:   true,
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ??
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
