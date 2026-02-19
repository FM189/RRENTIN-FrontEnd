import { PropertyType, PropertyStatus } from "@/types/property";

export interface Step1FormData {
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
}

export interface Step1FieldErrors {
  propertyType?: string;
  projectName?: string;
  address?: string;
  road?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  zipCode?: string;
  country?: string;
  propertyStatus?: string;
}

export function validatePropertyStep1(data: Step1FormData): Step1FieldErrors {
  const errors: Step1FieldErrors = {};

  if (!data.propertyType) {
    errors.propertyType = "propertyTypeRequired";
  } else if (
    !Object.values(PropertyType).includes(data.propertyType as PropertyType)
  ) {
    errors.propertyType = "propertyTypeRequired";
  }

  if (!data.projectName.trim()) {
    errors.projectName = "projectNameRequired";
  }

  if (!data.address.trim()) {
    errors.address = "addressRequired";
  }

  if (!data.province.trim()) {
    errors.province = "provinceRequired";
  }

  if (!data.district.trim()) {
    errors.district = "districtRequired";
  }

  if (!data.subDistrict.trim()) {
    errors.subDistrict = "subDistrictRequired";
  }

  if (!data.zipCode.trim()) {
    errors.zipCode = "zipCodeRequired";
  }

  if (!data.country.trim()) {
    errors.country = "countryRequired";
  }

  if (!data.propertyStatus) {
    errors.propertyStatus = "propertyStatusRequired";
  } else if (
    !Object.values(PropertyStatus).includes(
      data.propertyStatus as PropertyStatus
    )
  ) {
    errors.propertyStatus = "propertyStatusRequired";
  }

  return errors;
}
