export interface OnboardingData {
  // From signup
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  // Step 1: Basic Info
  experienceLevel: string;
  serviceType: string;
  hasNoLicense: boolean;
  licenseFile: File | null;
  // Step 2: Service Area
  country: string;
  stateProvince: string;
  city: string;
  area: string;
  availableDays: string;
  availableHoursOpen: string;
  availableHoursClose: string;
  // Step 3: Pricing Details
  showingBasePrice: string;
  inspectionBasePrice: string;
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  experienceLevel: "",
  serviceType: "",
  hasNoLicense: false,
  licenseFile: null,
  country: "",
  stateProvince: "",
  city: "",
  area: "",
  availableDays: "",
  availableHoursOpen: "",
  availableHoursClose: "",
  showingBasePrice: "",
  inspectionBasePrice: "",
};

export const ONBOARDING_STORAGE_KEY = "rrentin_sp_onboarding";
