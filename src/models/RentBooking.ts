import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRentBooking extends Document {
  // ── Relations ──────────────────────────────────────────────────────────────
  tenantId:   Types.ObjectId;
  ownerId:    Types.ObjectId;
  propertyId: Types.ObjectId;

  // ── Tenant personal info ───────────────────────────────────────────────────
  tenantInfo: {
    fullName:    string;
    currentCity: string;
    nationality: string;
    occupation:  string;
    designation: string;
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
  contractMonths:  number;
  rentalAmount:    number;
  securityDeposit: number;
  totalUpfront:    number;  // rentalAmount + securityDeposit

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
      fullName:    { type: String, required: true, trim: true },
      currentCity: { type: String, required: true, trim: true },
      nationality: { type: String, required: true, trim: true },
      occupation:  { type: String, required: true, trim: true },
      designation: { type: String, required: true, trim: true },
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

    status: {
      type:    String,
      enum:    ["pending", "accepted", "rejected", "payment_pending", "active", "completed", "cancelled"],
      default: "pending",
    },

    ownerNote: { type: String, default: "" },

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

// Indexes
RentBookingSchema.index({ tenantId: 1, status: 1 });
RentBookingSchema.index({ ownerId: 1, status: 1 });
RentBookingSchema.index({ propertyId: 1, status: 1 });

const RentBooking: Model<IRentBooking> =
  mongoose.models.RentBooking ??
  mongoose.model<IRentBooking>("RentBooking", RentBookingSchema);

export default RentBooking;
