"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export interface LoginResult {
  success: boolean;
  errors?: LoginFieldErrors;
}

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export async function loginAction(data: LoginData): Promise<LoginResult> {
  const errors: LoginFieldErrors = {};

  if (!data.email.trim()) {
    errors.email = "emailRequired";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "emailInvalid";
  }

  if (!data.password) {
    errors.password = "passwordRequired";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    await dbConnect();

    const user = await User.findOne({
      email: data.email.toLowerCase().trim(),
    }).select("+password");

    if (!user || !user.password) {
      return { success: false, errors: { email: "invalidCredentials" } };
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      return { success: false, errors: { email: "invalidCredentials" } };
    }

    // TODO: Create session/JWT token
    return { success: true };
  } catch {
    return { success: false, errors: { email: "serverError" } };
  }
}
