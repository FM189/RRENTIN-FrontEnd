import { isValidPhoneNumber } from "libphonenumber-js";
import { ExperienceLevel, ServiceType } from "@/types/user";

export interface Step1FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experienceLevel: string;
  serviceType: string;
}

export interface Step1FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  experienceLevel?: string;
  serviceType?: string;
}

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export function validateStep1(data: Step1FormData): Step1FieldErrors {
  const errors: Step1FieldErrors = {};

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

  if (!data.experienceLevel) {
    errors.experienceLevel = "experienceLevelRequired";
  } else if (
    !Object.values(ExperienceLevel).includes(
      data.experienceLevel as ExperienceLevel
    )
  ) {
    errors.experienceLevel = "experienceLevelRequired";
  }

  if (!data.serviceType) {
    errors.serviceType = "serviceTypeRequired";
  } else if (
    !Object.values(ServiceType).includes(data.serviceType as ServiceType)
  ) {
    errors.serviceType = "serviceTypeRequired";
  }

  return errors;
}

export interface Step2FormData {
  country: string;
  stateProvince: string;
  city: string;
  area: string;
  availableDays: string;
  availableHoursOpen: string;
  availableHoursClose: string;
}

export interface Step2FieldErrors {
  country?: string;
  stateProvince?: string;
  city?: string;
  area?: string;
  availableDays?: string;
  availableHoursOpen?: string;
  availableHoursClose?: string;
}

export function validateStep2(data: Step2FormData): Step2FieldErrors {
  const errors: Step2FieldErrors = {};

  if (!data.country) {
    errors.country = "countryRequired";
  }

  if (!data.stateProvince) {
    errors.stateProvince = "stateProvinceRequired";
  }

  if (!data.city) {
    errors.city = "cityRequired";
  }

  if (!data.area.trim()) {
    errors.area = "areaRequired";
  }

  if (!data.availableDays) {
    errors.availableDays = "availableDaysRequired";
  }

  if (!data.availableHoursOpen) {
    errors.availableHoursOpen = "availableHoursOpenRequired";
  }

  if (!data.availableHoursClose) {
    errors.availableHoursClose = "availableHoursCloseRequired";
  }

  return errors;
}

export interface Step3FormData {
  serviceType: string;
  showingBasePrice: string;
  inspectionBasePrice: string;
}

export interface Step3FieldErrors {
  showingBasePrice?: string;
  inspectionBasePrice?: string;
}

export function validateStep3(data: Step3FormData): Step3FieldErrors {
  const errors: Step3FieldErrors = {};

  if (data.serviceType === "showing_agent" && !data.showingBasePrice.trim()) {
    errors.showingBasePrice = "showingBasePriceRequired";
  }

  if (
    data.serviceType === "property_inspection" &&
    !data.inspectionBasePrice.trim()
  ) {
    errors.inspectionBasePrice = "inspectionBasePriceRequired";
  }

  return errors;
}
