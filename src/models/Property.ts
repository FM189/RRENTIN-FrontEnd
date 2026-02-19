import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { PropertyType, PropertyStatus } from "@/types/property";

export { PropertyType, PropertyStatus };

export interface IProperty extends Document {
  owner: Types.ObjectId;

  // Step 1: Basic Info
  propertyType: PropertyType;
  projectName: string;
  address: string;
  road?: string;
  province: string;
  district: string;
  subDistrict: string;
  zipCode: string;
  country: string;
  propertyStatus: PropertyStatus;
  showingDates?: string[];
  showingTimeFrom?: string;
  showingTimeTo?: string;
  latitude?: number;
  longitude?: number;

  // Step 2: Property Info
  propertyTitle?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  unitArea?: number;
  unitAreaUnit?: string;
  unitNumber?: string;
  propertyCondition?: string;
  buildingHeight?: string;
  floor?: number;
  selectBuilding?: string;

  // Step 3: Features & Amenities
  propertyFeatures?: string[];
  amenities?: string[];
  securityFeatures?: string[];
  rentalFeatures?: string[];
  propertyViews?: string[];
  customFeatures?: string[];
  customAmenities?: string[];
  customSecurity?: string[];
  customRentalFeatures?: string[];
  customViews?: string[];

  // Step 4: Photos
  photos?: string[];

  // Step 5: Pricing
  rentPrice?: number;
  depositMonths?: number;
  minimumLease?: number;

  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },

    // Step 1: Basic Info
    propertyType: {
      type: String,
      enum: Object.values(PropertyType),
      required: [true, "Property type is required"],
    },
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [200, "Project name cannot exceed 200 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    road: {
      type: String,
      trim: true,
    },
    province: {
      type: String,
      required: [true, "Province is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    subDistrict: {
      type: String,
      required: [true, "Sub district is required"],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, "Zip code is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      default: "Thailand",
    },
    propertyStatus: {
      type: String,
      enum: Object.values(PropertyStatus),
      required: [true, "Property status is required"],
    },
    showingDates: {
      type: [String],
    },
    showingTimeFrom: {
      type: String,
      trim: true,
    },
    showingTimeTo: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },

    // Step 2: Property Info
    propertyTitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    bedrooms: {
      type: Number,
    },
    bathrooms: {
      type: Number,
    },
    unitArea: {
      type: Number,
    },
    unitAreaUnit: {
      type: String,
      trim: true,
      default: "sqm",
    },
    unitNumber: {
      type: String,
      trim: true,
    },
    propertyCondition: {
      type: String,
      trim: true,
    },
    buildingHeight: {
      type: String,
      trim: true,
    },
    floor: {
      type: Number,
    },
    selectBuilding: {
      type: String,
      trim: true,
    },

    // Step 3: Features & Amenities
    propertyFeatures: {
      type: [String],
    },
    amenities: {
      type: [String],
    },
    securityFeatures: {
      type: [String],
    },
    rentalFeatures: {
      type: [String],
    },
    propertyViews: {
      type: [String],
    },
    customFeatures: {
      type: [String],
    },
    customAmenities: {
      type: [String],
    },
    customSecurity: {
      type: [String],
    },
    customRentalFeatures: {
      type: [String],
    },
    customViews: {
      type: [String],
    },

    // Step 4: Photos
    photos: {
      type: [String],
    },

    // Step 5: Pricing
    rentPrice: {
      type: Number,
    },
    depositMonths: {
      type: Number,
    },
    minimumLease: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

PropertySchema.index({ owner: 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ propertyStatus: 1 });
PropertySchema.index({ province: 1, district: 1 });

const Property: Model<IProperty> =
  mongoose.models.Property ||
  mongoose.model<IProperty>("Property", PropertySchema);

export default Property;
