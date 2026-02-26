import mongoose, { Schema, Document } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IPlatformFees extends Document {
  // Core fee rates
  platformFeeRate: number;   // e.g. 0.09  → 9% of transaction amount
  vatRate: number;           // e.g. 0.07  → 7% of platform fee (not of total)
  stripeFeePercent: number;  // e.g. 0.034 → 3.4% of transaction amount
  stripeFeeFixed: number;    // e.g. 10    → fixed THB per transaction

  // Rent-specific
  contractFeeRate: number;   // e.g. 0.05  → 5% of rent (one-time on first payment)

  // Deposit rules
  depositRefundWindowDays: number; // e.g. 3 → owner must raise issue within N days

  // Meta
  currency: string;          // "thb"
  isActive: boolean;
  updatedBy: string;         // admin user id who last changed fees
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const PlatformFeesSchema = new Schema<IPlatformFees>(
  {
    platformFeeRate:         { type: Number, required: true, default: 0.09  },
    vatRate:                 { type: Number, required: true, default: 0.07  },
    stripeFeePercent:        { type: Number, required: true, default: 0.034 },
    stripeFeeFixed:          { type: Number, required: true, default: 10    },
    contractFeeRate:         { type: Number, required: true, default: 0.05  },
    depositRefundWindowDays: { type: Number, required: true, default: 3     },
    currency:                { type: String, required: true, default: "thb" },
    isActive:                { type: Boolean, default: true },
    updatedBy:               { type: String, default: "system" },
  },
  { timestamps: true }
);

// ─── Model ────────────────────────────────────────────────────────────────────

const PlatformFees: mongoose.Model<IPlatformFees> =
  mongoose.models.PlatformFees ||
  mongoose.model<IPlatformFees>("PlatformFees", PlatformFeesSchema);

export default PlatformFees;
