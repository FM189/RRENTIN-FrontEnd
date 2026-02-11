"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User, { UserRole, ServiceType, ExperienceLevel } from "@/models/User";

export interface ServiceProviderSignUpData {
  // From signup
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  // Step 1
  experienceLevel: string;
  serviceType: string;
  hasNoLicense: boolean;
  // Step 2
  country: string;
  stateProvince: string;
  city: string;
  area: string;
  availableDays: string;
  availableHoursOpen: string;
  availableHoursClose: string;
  // Step 3
  showingBasePrice: string;
  inspectionBasePrice: string;
}

export interface ServiceProviderSignUpResult {
  success: boolean;
  error?: string;
}

export async function serviceProviderSignUpAction(
  data: ServiceProviderSignUpData
): Promise<ServiceProviderSignUpResult> {
  try {
    await dbConnect();

    const existingEmail = await User.findOne({
      email: data.email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return { success: false, error: "emailExists" };
    }

    const existingPhone = await User.findOne({
      phone: data.phone.trim(),
    });

    if (existingPhone) {
      return { success: false, error: "phoneExists" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await User.create({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      password: hashedPassword,
      role: UserRole.SERVICE_PROVIDER,
      serviceType: data.serviceType as ServiceType,
      experienceLevel: data.experienceLevel as ExperienceLevel,
      hasNoLicense: data.hasNoLicense,
      country: data.country,
      stateProvince: data.stateProvince,
      city: data.city,
      area: data.area.trim(),
      availableDays: data.availableDays,
      availableHoursOpen: data.availableHoursOpen,
      availableHoursClose: data.availableHoursClose,
      showingBasePrice: data.showingBasePrice
        ? parseFloat(data.showingBasePrice)
        : undefined,
      inspectionBasePrice: data.inspectionBasePrice
        ? parseFloat(data.inspectionBasePrice)
        : undefined,
      isEmailVerified: false,
      isKYCVerified: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    return { success: true };
  } catch {
    return { success: false, error: "serverError" };
  }
}
