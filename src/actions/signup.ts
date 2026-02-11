"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User, { UserRole } from "@/models/User";
import {
  SignUpFormData,
  FieldErrors,
  validateSignUp,
} from "@/lib/validations/signup";

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return !!user;
  } catch {
    return false;
  }
}

export async function checkPhoneExists(phone: string): Promise<boolean> {
  try {
    await dbConnect();
    const user = await User.findOne({ phone: phone.trim() });
    return !!user;
  } catch {
    return false;
  }
}

export interface SignUpResult {
  success: boolean;
  errors?: FieldErrors;
  message?: string;
}

export async function signUpAction(data: SignUpFormData): Promise<SignUpResult> {
  const errors = validateSignUp(data);

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    await dbConnect();

    const existingEmail = await User.findOne({
      email: data.email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return { success: false, errors: { email: "emailExists" } };
    }

    const existingPhone = await User.findOne({
      phone: data.phone.trim(),
    });

    if (existingPhone) {
      return { success: false, errors: { phone: "phoneExists" } };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await User.create({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      password: hashedPassword,
      role: data.role as UserRole,
      isEmailVerified: false,
      isKYCVerified: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    return { success: true, message: "success" };
  } catch {
    return { success: false, errors: { email: "serverError" } };
  }
}
