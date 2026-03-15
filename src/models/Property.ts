import mongoose, { Schema, Document, Types } from "mongoose";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const ContractSchema = new Schema(
  {
    months:          { type: Number, required: true, min: 1 },
    rentPrice:       { type: String, required: true },
    securityDeposit: { type: String, required: true },
  },
  { _id: false }
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const PropertySchema = new Schema(
  {
    owner: { type: Types.ObjectId, ref: "User", required: true },

    // ── Step 1: Basic Info ────────────────────────────────────────────────────
    propertyType:    { type: String, required: true },
    projectName:     { type: String, required: true },
    address:         { type: String, required: true },
    road:            { type: String, default: "" },
    province:        { type: String, required: true },
    district:        { type: String, required: true },
    subDistrict:     { type: String, required: true },
    zipCode:         { type: String, required: true },
    country:         { type: String, default: "TH" },
    propertyStatus:  { type: String, required: true, enum: ["available", "rented", "unavailable"] },
    showingDates:    [{ type: String }],
    showingTimeFrom: { type: String, default: "" },
    showingTimeTo:   { type: String, default: "" },

    // GeoJSON Point — enables $near / $geoWithin queries
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    // ── Step 2: Property Info ─────────────────────────────────────────────────
    propertyTitle:     { type: String, required: true },
    description:       { type: String, default: "" },
    bedrooms:          { type: Number, default: 1, min: 0 },
    bathrooms:         { type: Number, default: 1, min: 0 },
    unitArea:          { type: String, default: "" },
    unitAreaUnit:      { type: String, default: "sqm" },
    unitNumber:        { type: String, default: "" },
    propertyCondition: { type: String, default: "" },
    buildingHeight:    { type: String, default: "" },
    floor:             { type: Number, default: 1 },
    selectBuilding:    { type: String, default: "" },
    customBuilding:    { type: String, default: "" },

    // ── Step 3: Features & Amenities ─────────────────────────────────────────
    propertyFeatures:    [{ type: String }],
    amenities:           [{ type: String }],
    securityFeatures:    [{ type: String }],
    rentalFeatures:      [{ type: String }],
    propertyViews:       [{ type: String }],
    customFeatures:      [{ type: String }],
    customAmenities:     [{ type: String }],
    customSecurity:      [{ type: String }],
    customRentalFeatures:[{ type: String }],
    customViews:         [{ type: String }],

    // ── Step 4: Photos & Documents (S3 URLs) ─────────────────────────────────
    photos:                [{ type: String }], // S3 URLs
    hasFloorPlan:          { type: Boolean, default: false },
    floorPlanImages:       [{ type: String }], // S3 URLs
    ownershipVerification: { type: String, default: "" },
    ownershipDocuments:    [{ type: String }], // S3 URLs

    // ── Step 5: Pricing ───────────────────────────────────────────────────────
    visitRequestPrice: { type: String, default: "" },
    propertyPrice:     { type: String, default: "" },
    contracts:         { type: [ContractSchema], default: [] },
    customFees:        { type: [{ name: { type: String }, amount: { type: Number, default: 0 } }], default: [] },

    // ── Admin approval ────────────────────────────────────────────────────────
    approvalStatus: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalNote: { type: String, default: "" }, // admin rejection/note message
  },
  {
    timestamps: true,
  }
);


export interface IProperty extends Document {
  owner: Types.ObjectId;
  // Step 1
  propertyType: string;
  projectName: string;
  address: string;
  road: string;
  province: string;
  district: string;
  subDistrict: string;
  zipCode: string;
  country: string;
  propertyStatus: string;
  showingDates: string[];
  showingTimeFrom: string;
  showingTimeTo: string;
  location: { type: string; coordinates: [number, number] };
  // Step 2
  propertyTitle: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  unitArea: string;
  unitAreaUnit: string;
  unitNumber: string;
  propertyCondition: string;
  buildingHeight: string;
  floor: number;
  selectBuilding: string;
  customBuilding: string;
  // Step 3
  propertyFeatures: string[];
  amenities: string[];
  securityFeatures: string[];
  rentalFeatures: string[];
  propertyViews: string[];
  customFeatures: string[];
  customAmenities: string[];
  customSecurity: string[];
  customRentalFeatures: string[];
  customViews: string[];
  // Step 4
  photos: string[];
  hasFloorPlan: boolean;
  floorPlanImages: string[];
  ownershipVerification: string;
  ownershipDocuments: string[];
  // Step 5
  visitRequestPrice: string;
  propertyPrice: string;
  contracts: { months: number; rentPrice: string; securityDeposit: string }[];
  customFees: { name: string; amount: number }[];
  // Admin approval
  approvalStatus: "pending" | "approved" | "rejected";
  approvalNote: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const Property: mongoose.Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);

export default Property;
