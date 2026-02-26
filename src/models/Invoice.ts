import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ─── Counter helper for sequential invoice numbers ────────────────────────────

const CounterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter: Model<{ _id: string; seq: number }> =
  mongoose.models.Counter ?? mongoose.model("Counter", CounterSchema);

export async function nextInvoiceNumber(): Promise<string> {
  const year    = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    `invoice_${year}`,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `INV-${year}-${String(counter!.seq).padStart(5, "0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvoiceReferenceType = "visit_request" | "rent_booking" | "agent_service";
export type InvoiceStatus        = "issued" | "cancelled";

export interface ILineItem {
  description: string;
  amount:      number; // pre-VAT in THB
  vatRate:     number; // e.g. 0.07
  vatAmount:   number;
  total:       number; // amount + vatAmount
}

export interface IInvoice extends Document {
  invoiceNumber:  string;
  referenceId:    Types.ObjectId;
  referenceType:  InvoiceReferenceType;
  propertyId:     Types.ObjectId | null;

  issuedTo: {
    userId:   Types.ObjectId;
    fullName: string;
    email:    string;
    address:  string;
    taxId:    string; // populated if tenant/owner provides tax ID
  };

  issuedBy: {
    name:    string;
    address: string;
    taxId:   string;
  };

  lineItems: ILineItem[];
  subtotal:  number; // sum of pre-VAT amounts
  vatTotal:  number; // sum of VAT amounts
  total:     number; // subtotal + vatTotal
  currency:  string;

  stripeRef:   string; // PaymentIntent / transfer ID
  pdfUrl:      string; // populated when PDF is generated

  status:      InvoiceStatus;
  issuedAt:    Date;
  cancelledAt: Date | null;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const LineItemSchema = new Schema<ILineItem>(
  {
    description: { type: String, required: true },
    amount:      { type: Number, required: true },
    vatRate:     { type: Number, default: 0 },
    vatAmount:   { type: Number, default: 0 },
    total:       { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    referenceId:   { type: Schema.Types.ObjectId, required: true, index: true },
    referenceType: {
      type:     String,
      enum:     ["visit_request", "rent_booking", "agent_service"],
      required: true,
      index:    true,
    },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", default: null },

    issuedTo: {
      userId:   { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
      fullName: { type: String, default: "" },
      email:    { type: String, default: "" },
      address:  { type: String, default: "" },
      taxId:    { type: String, default: "" },
    },

    issuedBy: {
      name:    { type: String, default: process.env.PLATFORM_NAME    ?? "RRentin" },
      address: { type: String, default: process.env.PLATFORM_ADDRESS ?? "" },
      taxId:   { type: String, default: process.env.PLATFORM_TAX_ID  ?? "" },
    },

    lineItems: { type: [LineItemSchema], default: [] },
    subtotal:  { type: Number, required: true },
    vatTotal:  { type: Number, required: true },
    total:     { type: Number, required: true },
    currency:  { type: String, default: "thb" },

    stripeRef: { type: String, default: "" },
    pdfUrl:    { type: String, default: "" },

    status:      { type: String, enum: ["issued", "cancelled"], default: "issued", index: true },
    issuedAt:    { type: Date, default: () => new Date() },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice ?? mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
