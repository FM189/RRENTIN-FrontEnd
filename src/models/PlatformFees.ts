import mongoose, { Schema, Document } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IPlatformFees extends Document {
  // Core fee rates
  platformFeeRate:  number;   // e.g. 0.09  → 9% of rent, deducted from owner payout each month
  vatRate:          number;   // e.g. 0.07  → 7% VAT on platform fee
  stripeFeePercent: number;   // e.g. 0.034 → 3.4% of transaction amount
  stripeFeeFixed:   number;   // e.g. 10    → fixed THB per transaction

  // Tenant contract fee (one-time, charged at first payment)
  tenantContractFeeEnabled: boolean;  // toggle on/off
  tenantContractFeeRate:    number;   // e.g. 0.05 → 5% of total contract value

  // Owner contract fee (one-time, deducted from first month payout)
  ownerContractFeeEnabled: boolean;  // toggle on/off
  ownerContractFeeRate:    number;   // e.g. 0.05 → 5% of total contract value

  // Deposit rules
  depositRefundWindowDays:  number;  // e.g. 3    → days after moveOut owner can raise issue
  depositHoldTriggerHours:  number;  // e.g. 24   → hours before moveOut to trigger real hold
  resolutionDisputeFeeRate: number;  // e.g. 0.08 → 8% of damage amount charged from hold

  // Meta
  currency:  string;   // "thb"
  isActive:  boolean;
  updatedBy: string;   // admin user id who last changed fees
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const PlatformFeesSchema = new Schema<IPlatformFees>(
  {
    platformFeeRate:  { type: Number, required: true, default: 0.09  },
    vatRate:          { type: Number, required: true, default: 0.07  },
    stripeFeePercent: { type: Number, required: true, default: 0.034 },
    stripeFeeFixed:   { type: Number, required: true, default: 10    },

    tenantContractFeeEnabled: { type: Boolean, default: true },
    tenantContractFeeRate:    { type: Number, required: true, default: 0.05 },

    ownerContractFeeEnabled: { type: Boolean, default: true },
    ownerContractFeeRate:    { type: Number, required: true, default: 0.05 },

    depositRefundWindowDays:  { type: Number, required: true, default: 3    },
    depositHoldTriggerHours:  { type: Number, required: true, default: 24   },
    resolutionDisputeFeeRate: { type: Number, required: true, default: 0.08 },

    currency:  { type: String,  required: true, default: "thb" },
    isActive:  { type: Boolean, default: true },
    updatedBy: { type: String,  default: "system" },
  },
  { timestamps: true }
);

// ─── Model ────────────────────────────────────────────────────────────────────

const PlatformFees: mongoose.Model<IPlatformFees> =
  mongoose.models.PlatformFees ||
  mongoose.model<IPlatformFees>("PlatformFees", PlatformFeesSchema);

export default PlatformFees;
