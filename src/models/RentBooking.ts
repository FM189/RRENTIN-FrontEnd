import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBookingFees {
  // Tenant-side (charged at first payment)
  tenantContractFeeEnabled: boolean;
  tenantContractFeeRate:    number;   // snapshot from PlatformFees
  tenantContractFee:        number;   // calculated amount (0 if disabled)
  tenantContractFeeVat:     number;   // VAT on contract fee (0 if disabled)
  tenantTotalCharged:       number;   // rentalAmount + contractFee + vat = PI amount

  // Owner-side (deducted from first payout)
  ownerContractFeeEnabled: boolean;
  ownerContractFeeRate:    number;   // snapshot from PlatformFees
  ownerContractFee:        number;   // calculated amount (0 if disabled)

  // Snapshotted rates for recurring payout calculations
  platformFeeRate:  number;
  vatRate:          number;
  stripeFeePercent: number;
  stripeFeeFixed:   number;
  lateFeeRate:      number;   // 15% of monthly rent — platform revenue, applied after all retries
}

export interface IRentBooking extends Document {
  // ── Relations ──────────────────────────────────────────────────────────────
  tenantId:   Types.ObjectId;
  ownerId:    Types.ObjectId;
  propertyId: Types.ObjectId;

  // ── Tenant personal info ───────────────────────────────────────────────────
  tenantInfo: {
    fullName:       string;
    currentCountry: string;
    nationality:    string;
    occupation:     string;
    designation:    string;
  };

  // ── Stay details ───────────────────────────────────────────────────────────
  moveInDate:  string;   // YYYY-MM-DD
  moveOutDate: string;   // YYYY-MM-DD
  arrivalTime: string;
  stayDays:    number;

  // ── Preferences ────────────────────────────────────────────────────────────
  guestsStaying:  string;
  primaryReason:  string;
  visaType:       string;
  specialRequests: string;

  // ── Contract snapshot (locked at booking time) ─────────────────────────────
  contractMonths:  number;  // total billing cycles = fullMonths + (remainderDays > 0 ? 1 : 0)
  rentalAmount:    number;  // monthly rate from matched contract
  securityDeposit: number;
  totalUpfront:    number;  // rentalAmount + contractFee + VAT (first payment only)
  dailyRate:       number;  // rentalAmount / 30
  remainderDays:   number;  // stayDays % 30; 0 means no partial last month

  // ── Recurring rent tracking (Phase 4) ─────────────────────────────────────
  rentMonthsPaid:   number;        // incremented after each successful charge (starts at 1 after upfront)
  nextRentDueDate:  Date | null;   // set after upfront payment; cleared when all months paid
  autoCharge:       boolean;       // true if first month paid by card (off-session charge enabled)
  overdueMonths:    number;        // how many months currently unpaid
  overdueAmount:    number;        // total THB overdue
  stripeRetryCount:          number;        // charge attempts made for current cycle (resets to 0 on success)
  lateFeePendingAt:          Date | null;   // set after all retries exhausted; late fee applied when this passes (48h grace)
  isRestricted:              boolean;       // true when late fee applied — blocks new bookings
  totalPaymentFailureCycles: number;        // how many billing cycles have had all retries exhausted (ever)

  // ── Status lifecycle ───────────────────────────────────────────────────────
  status:
    | "pending"          // submitted by tenant, awaiting owner decision
    | "accepted"         // owner accepted, awaiting tenant upfront payment
    | "rejected"         // owner rejected
    | "payment_pending"  // tenant initiated payment
    | "active"           // payment confirmed, lease is active
    | "completed"        // lease ended, tenant checked out
    | "cancelled";       // cancelled by either party

  ownerNote: string;  // reason for rejection or any note from owner

  // ── Rental Agreement ───────────────────────────────────────────────────────
  agreement: {
    pdfUrl:          string;
    ownerSignedAt:   Date | null;
    tenantSignedAt:  Date | null;
    ownerIp:         string;
    tenantIp:        string;
    // extra fields owner fills during signing
    ownerAddress:    string;
    internetCharge:  number;
    parkingFee:      number;
    includedItems:       string;  // free-text list of items in premises (clause 31)
    ownerSignatureData:  string;  // base64 PNG — stored for PDF regeneration when tenant signs
    tenantSignatureData: string;
  };

  // ── Fee snapshot (locked at booking creation from PlatformFees) ───────────
  fees: IBookingFees;

  // ── Stripe ─────────────────────────────────────────────────────────────────
  stripe: {
    customerId:                string;  // Stripe Customer ID for the tenant
    setupIntentId:             string;  // SetupIntent used to save the card
    lockedPaymentMethodId:     string;  // saved card — locked for lease duration
    firstMonthPaymentIntentId: string;  // PaymentIntent for 1st month rent
    firstMonthPaidAt:          Date | null;
  };

  createdAt: Date;
  updatedAt: Date;
}

const RentBookingSchema = new Schema<IRentBooking>(
  {
    tenantId:   { type: Schema.Types.ObjectId, ref: "User",     required: true },
    ownerId:    { type: Schema.Types.ObjectId, ref: "User",     required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },

    tenantInfo: {
      fullName:       { type: String, required: true, trim: true },
      currentCountry: { type: String, required: true, trim: true },
      nationality:    { type: String, required: true, trim: true },
      occupation:     { type: String, required: true, trim: true },
      designation:    { type: String, required: true, trim: true },
    },

    moveInDate:  { type: String, required: true },
    moveOutDate: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    stayDays:    { type: Number, required: true, min: 1 },

    guestsStaying:   { type: String, required: true },
    primaryReason:   { type: String, required: true },
    visaType:        { type: String, required: true },
    specialRequests: { type: String, default: "" },

    contractMonths:  { type: Number, required: true, min: 1 },
    rentalAmount:    { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    totalUpfront:    { type: Number, required: true, min: 0 },
    dailyRate:       { type: Number, required: true, min: 0 },
    remainderDays:   { type: Number, required: true, min: 0, default: 0 },

    rentMonthsPaid:   { type: Number,  default: 0     },
    nextRentDueDate:  { type: Date,    default: null   },
    autoCharge:       { type: Boolean, default: false  },
    overdueMonths:    { type: Number,  default: 0      },
    overdueAmount:    { type: Number,  default: 0      },
    stripeRetryCount:          { type: Number,  default: 0     },
    lateFeePendingAt:          { type: Date,    default: null  },
    isRestricted:              { type: Boolean, default: false },
    totalPaymentFailureCycles: { type: Number,  default: 0     },

    status: {
      type:    String,
      enum:    ["pending", "accepted", "rejected", "payment_pending", "active", "completed", "cancelled"],
      default: "pending",
    },

    ownerNote: { type: String, default: "" },

    agreement: {
      pdfUrl:         { type: String, default: "" },
      ownerSignedAt:  { type: Date,   default: null },
      tenantSignedAt: { type: Date,   default: null },
      ownerIp:        { type: String, default: "" },
      tenantIp:       { type: String, default: "" },
      ownerAddress:   { type: String, default: "" },
      internetCharge: { type: Number, default: 0 },
      parkingFee:     { type: Number, default: 0 },
      includedItems:       { type: String, default: "" },
      ownerSignatureData:  { type: String, default: "" },
      tenantSignatureData: { type: String, default: "" },
    },

    fees: {
      tenantContractFeeEnabled: { type: Boolean, default: true  },
      tenantContractFeeRate:    { type: Number,  default: 0.05  },
      tenantContractFee:        { type: Number,  default: 0     },
      tenantContractFeeVat:     { type: Number,  default: 0     },
      tenantTotalCharged:       { type: Number,  default: 0     },
      ownerContractFeeEnabled:  { type: Boolean, default: true  },
      ownerContractFeeRate:     { type: Number,  default: 0.05  },
      ownerContractFee:         { type: Number,  default: 0     },
      platformFeeRate:          { type: Number,  default: 0.09  },
      vatRate:                  { type: Number,  default: 0.07  },
      stripeFeePercent:         { type: Number,  default: 0.034 },
      stripeFeeFixed:           { type: Number,  default: 10    },
      lateFeeRate:              { type: Number,  default: 0.15  },
    },

    stripe: {
      customerId:                { type: String, default: "" },
      setupIntentId:             { type: String, default: "" },
      lockedPaymentMethodId:     { type: String, default: "" },
      firstMonthPaymentIntentId: { type: String, default: "" },
      firstMonthPaidAt:          { type: Date,   default: null },
    },
  },
  { timestamps: true }
);

RentBookingSchema.index({ tenantId: 1, status: 1 });
RentBookingSchema.index({ ownerId: 1, status: 1 });
RentBookingSchema.index({ propertyId: 1, status: 1 });
RentBookingSchema.index({ status: 1, autoCharge: 1, nextRentDueDate: 1 }); // cron query

const RentBooking: Model<IRentBooking> =
  mongoose.models.RentBooking ??
  mongoose.model<IRentBooking>("RentBooking", RentBookingSchema);

export default RentBooking;
