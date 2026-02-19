"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Country, State, City } from "country-state-city";
import { Select } from "@/components/ui";
import OnboardingField from "@/components/onboarding/OnboardingField";
import ShowingDateTimePicker from "./ShowingDateTimePicker";
import PropertyGoogleMap from "./PropertyGoogleMap";
import { AddPropertyData } from "@/types/property";
import {
  validatePropertyStep1,
  Step1FieldErrors,
} from "@/lib/validations/property";

interface Step1Props {
  formData: AddPropertyData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onFormDataChange: (updates: Partial<AddPropertyData>) => void;
  onNext: () => void;
}

export default function Step1BasicInfo({
  formData,
  onChange,
  onFormDataChange,
  onNext,
}: Step1Props) {
  const t = useTranslations("Dashboard.properties.addPropertyPage");
  const [fieldErrors, setFieldErrors] = useState<Step1FieldErrors>({});

  const selectClassName =
    "h-10.75! rounded-lg! border-[rgba(65,65,65,0.16)]! shadow-[0px_0px_10px_rgba(0,0,0,0.07)]!";

  // Country options
  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        value: c.isoCode,
        label: c.name,
      })),
    []
  );

  // Province options (states of selected country)
  const provinceOptions = useMemo(() => {
    if (!formData.country) return [];
    return State.getStatesOfCountry(formData.country).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));
  }, [formData.country]);

  // District options (cities of selected province)
  const districtOptions = useMemo(() => {
    if (!formData.country || !formData.province) return [];
    return City.getCitiesOfState(formData.country, formData.province).map(
      (c) => ({
        value: c.name,
        label: c.name,
      })
    );
  }, [formData.country, formData.province]);

  const handleNext = () => {
    const errors = validatePropertyStep1({
      propertyType: formData.propertyType,
      projectName: formData.projectName,
      address: formData.address,
      road: formData.road,
      province: formData.province,
      district: formData.district,
      subDistrict: formData.subDistrict,
      zipCode: formData.zipCode,
      country: formData.country,
      propertyStatus: formData.propertyStatus,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onNext();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;

    onChange(e);

    // Clear dependent fields when parent changes
    const clearField = (field: string) =>
      onChange({
        target: { name: field, value: "", type: "select-one" },
      } as React.ChangeEvent<HTMLSelectElement>);

    if (name === "country") {
      clearField("province");
      clearField("district");
      clearField("subDistrict");
    } else if (name === "province") {
      clearField("district");
      clearField("subDistrict");
    }

    if (fieldErrors[name as keyof Step1FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const getError = (field: keyof Step1FieldErrors): string | undefined => {
    const errorKey = fieldErrors[field];
    if (!errorKey) return undefined;
    return t(`errors.${errorKey}`);
  };

  const propertyTypeOptions = [
    { value: "house", label: t("propertyTypes.house") },
    { value: "villa", label: t("propertyTypes.villa") },
    { value: "condo", label: t("propertyTypes.condo") },
    { value: "apartment", label: t("propertyTypes.apartment") },
    { value: "townhouse", label: t("propertyTypes.townhouse") },
    { value: "retail_space", label: t("propertyTypes.retail_space") },
    { value: "office", label: t("propertyTypes.office") },
  ];

  const propertyStatusOptions = [
    { value: "available", label: t("statusOptions.available") },
    { value: "rented", label: t("statusOptions.rented") },
    { value: "unavailable", label: t("statusOptions.unavailable") },
  ];

  return (
    <>
      <h2 className="text-base lg:text-lg font-medium capitalize text-heading">
        {t("sectionTitle")}
      </h2>

      <div className="w-full flex flex-col gap-4 lg:gap-5">
        {/* Row: Property Type / Project Name */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <Select
              label={t("propertyType")}
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              options={propertyTypeOptions}
              placeholder={t("selectPlaceholder")}
              error={getError("propertyType")}
              className={selectClassName}
            />
          </div>
          <OnboardingField
            label={t("projectName")}
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            error={getError("projectName")}
          />
        </div>

        {/* Row: Address / Road */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <OnboardingField
            label={t("address")}
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={getError("address")}
          />
          <OnboardingField
            label={t("road")}
            name="road"
            value={formData.road}
            onChange={handleChange}
            error={getError("road")}
          />
        </div>

        {/* Row: Province / District */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <Select
              label={t("province")}
              name="province"
              value={formData.province}
              onChange={handleChange}
              options={provinceOptions}
              placeholder={t("selectPlaceholder")}
              error={getError("province")}
              className={selectClassName}
            />
          </div>
          <div className="flex-1">
            <Select
              label={t("district")}
              name="district"
              value={formData.district}
              onChange={handleChange}
              options={districtOptions}
              placeholder={t("selectPlaceholder")}
              error={getError("district")}
              className={selectClassName}
            />
          </div>
        </div>

        {/* Row: Sub District / Zip Code */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <OnboardingField
            label={t("subDistrict")}
            name="subDistrict"
            value={formData.subDistrict}
            onChange={handleChange}
            error={getError("subDistrict")}
          />
          <OnboardingField
            label={t("zipCode")}
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            error={getError("zipCode")}
          />
        </div>

        {/* Row: Country / Property Status */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <Select
              label={t("country")}
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={countryOptions}
              placeholder={t("selectPlaceholder")}
              error={getError("country")}
              className={selectClassName}
            />
          </div>
          <div className="flex-1">
            <Select
              label={t("propertyStatus")}
              name="propertyStatus"
              value={formData.propertyStatus}
              onChange={handleChange}
              options={propertyStatusOptions}
              placeholder={t("selectPlaceholder")}
              error={getError("propertyStatus")}
              className={selectClassName}
            />
          </div>
        </div>

        {/* Show Date and Time */}
        <ShowingDateTimePicker
          selectedDates={formData.showingDates}
          timeFrom={formData.showingTimeFrom}
          timeTo={formData.showingTimeTo}
          onDatesChange={(dates) => onFormDataChange({ showingDates: dates })}
          onTimeFromChange={(time) =>
            onFormDataChange({ showingTimeFrom: time })
          }
          onTimeToChange={(time) => onFormDataChange({ showingTimeTo: time })}
        />

        {/* Google Map */}
        <PropertyGoogleMap
          latitude={formData.latitude}
          longitude={formData.longitude}
          onLocationChange={(lat, lng) =>
            onFormDataChange({ latitude: lat, longitude: lng })
          }
        />
      </div>

      {/* Next button */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2.5 bg-primary text-white text-base font-medium rounded hover:bg-primary-hover transition-colors"
        >
          {t("next")}
        </button>
      </div>
    </>
  );
}
