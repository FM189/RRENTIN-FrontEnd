import { isValidPhoneNumber } from "libphonenumber-js";
import { UserRole } from "@/types/user";

export interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  agreeTerms: boolean;
}

export interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  agreeTerms?: string;
}

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const ALLOWED_ROLES = [UserRole.TENANT, UserRole.OWNER] as string[];

export function validateSignUp(data: SignUpFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = "firstNameRequired";
  }

  if (!data.lastName.trim()) {
    errors.lastName = "lastNameRequired";
  }

  if (!data.email.trim()) {
    errors.email = "emailRequired";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "emailInvalid";
  }

  if (!data.phone.trim()) {
    errors.phone = "phoneRequired";
  } else if (!isValidPhoneNumber(data.phone)) {
    errors.phone = "phoneInvalid";
  }

  if (!data.password) {
    errors.password = "passwordRequired";
  } else if (data.password.length < 8) {
    errors.password = "passwordMinLength";
  }

  if (!data.role) {
    errors.role = "roleRequired";
  } else if (!ALLOWED_ROLES.includes(data.role)) {
    errors.role = "roleRequired";
  }

  if (!data.agreeTerms) {
    errors.agreeTerms = "termsRequired";
  }

  return errors;
}
