import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IVisitRequest extends Document {
  tenantId:        Types.ObjectId;
  ownerId:         Types.ObjectId;
  propertyId:      Types.ObjectId;
  assignedAgentId: Types.ObjectId | null;

  tenantInfo: {
    fullName:           string;
    moveInDate:         string;
    moveOutDate:        string;
    nationality:        string;
    numberOfOccupants:  string;
    purposeOfRental:    string;
  };

  preferredDate: string;
  preferredTime: string;

  visitFee: number;
  feeBreakdown: {
    platformFee: number;
    vat:         number;
    stripeFee:   number;
    total:       number;
  };

  payment: {
    stripePaymentIntentId: string;
    status: "pending" | "paid" | "refunded";
    paidAt: Date | null;
  };

  escrow: {
    status:           "held" | "released" | "refunded";
    stripeTransferId: string;
    releasedAt:       Date | null;
  };

  ownerAction: "show_self" | "hire_new_agent" | "hire_existing_agent" | null;
  qrToken:     string;
  qrScannedAt: Date | null;

  status:
    | "payment_pending"
    | "payment_confirmed"
    | "owner_review"
    | "accepted"
    | "completed"
    | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const VisitRequestSchema = new Schema<IVisitRequest>(
  {
    tenantId:        { type: Schema.Types.ObjectId, ref: "User",     required: true },
    ownerId:         { type: Schema.Types.ObjectId, ref: "User",     required: true },
    propertyId:      { type: Schema.Types.ObjectId, ref: "Property", required: true },
    assignedAgentId: { type: Schema.Types.ObjectId, ref: "User",     default: null },

    tenantInfo: {
      fullName:          { type: String, required: true },
      moveInDate:        { type: String, required: true },
      moveOutDate:       { type: String, required: true },
      nationality:       { type: String, required: true },
      numberOfOccupants: { type: String, required: true },
      purposeOfRental:   { type: String, required: true },
    },

    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },

    visitFee: { type: Number, required: true },
    feeBreakdown: {
      platformFee: { type: Number, default: 0 },
      vat:         { type: Number, default: 0 },
      stripeFee:   { type: Number, default: 0 },
      total:       { type: Number, default: 0 },
    },

    payment: {
      stripePaymentIntentId: { type: String, default: "" },
      status:                { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
      paidAt:                { type: Date,   default: null },
    },

    escrow: {
      status:           { type: String, enum: ["held", "pending_release", "released", "refunded"], default: "held" },
      stripeTransferId: { type: String, default: "" },
      releasedAt:       { type: Date,   default: null },
    },

    ownerAction: {
      type:    String,
      enum:    ["show_self", "hire_new_agent", "hire_existing_agent", null],
      default: null,
    },
    qrToken:     { type: String, default: null, index: { sparse: true } },
    qrScannedAt: { type: Date,   default: null },

    status: {
      type:    String,
      enum:    ["payment_pending", "payment_confirmed", "owner_review", "accepted", "completed", "cancelled"],
      default: "payment_pending",
    },
  },
  { timestamps: true }
);

const VisitRequest: Model<IVisitRequest> =
  mongoose.models.VisitRequest ??
  mongoose.model<IVisitRequest>("VisitRequest", VisitRequestSchema);

// Drop any pre-existing qrToken index (may be a bad unique non-sparse one)
// and let Mongoose recreate it correctly from the schema definition above.
async function dropOldQrTokenIndex() {
  try {
    const col = mongoose.connection.collection("visitrequests");
    const indexes = await col.indexes();
    const exists = indexes.find((ix) => ix.name === "qrToken_1");
    if (exists && (exists.unique || !exists.sparse)) {
      await col.dropIndex("qrToken_1");
    }
  } catch {
    // Ignore — collection not yet created or index already gone
  }
}

if (mongoose.connection.readyState === 1) {
  dropOldQrTokenIndex();
} else {
  mongoose.connection.once("open", dropOldQrTokenIndex);
}

export default VisitRequest;
