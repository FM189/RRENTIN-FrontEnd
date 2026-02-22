import mongoose, { Schema, Document, Model } from "mongoose";
import {
  UserRole,
  ServiceType,
  ExperienceLevel,
} from "@/types/user";

export { UserRole, ServiceType, ExperienceLevel };

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  googleId?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  isKYCVerified: boolean;
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  serviceType?: ServiceType;
  experienceLevel?: ExperienceLevel;
  licenseUrl?: string;
  hasNoLicense?: boolean;
  country?: string;
  stateProvince?: string;
  city?: string;
  area?: string;
  availableDays?: string;
  availableHoursOpen?: string;
  availableHoursClose?: string;
  showingBasePrice?: number;
  inspectionBasePrice?: number;
  stripeCustomerId?: string;
  stripeAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, "Role is required"],
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    profileImage: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isKYCVerified: {
      type: Boolean,
      default: false,
    },
    termsAccepted: {
      type: Boolean,
      required: [true, "Terms and conditions must be accepted"],
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
    },
    serviceType: {
      type: String,
      enum: Object.values(ServiceType),
    },
    experienceLevel: {
      type: String,
      enum: Object.values(ExperienceLevel),
    },
    licenseUrl: {
      type: String,
    },
    hasNoLicense: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
      trim: true,
    },
    stateProvince: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    availableDays: {
      type: String,
      trim: true,
    },
    availableHoursOpen: {
      type: String,
      trim: true,
    },
    availableHoursClose: {
      type: String,
      trim: true,
    },
    showingBasePrice: {
      type: Number,
    },
    inspectionBasePrice: {
      type: Number,
    },
    stripeCustomerId: {
      type: String,
    },
    stripeAccountId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ role: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
