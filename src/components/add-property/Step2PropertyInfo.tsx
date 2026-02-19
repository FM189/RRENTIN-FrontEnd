"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui";
import OnboardingField from "@/components/onboarding/OnboardingField";
import CounterField from "./CounterField";
import { AddPropertyData } from "@/types/property";

interface Step2Props {
  formData: AddPropertyData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onFormDataChange: (updates: Partial<AddPropertyData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface Step2FieldErrors {
  propertyTitle?: string;
  description?: string;
  propertyCondition?: string;
  buildingHeight?: string;
}

export default function Step2PropertyInfo({
  formData,
  onChange,
  onFormDataChange,
  onNext,
  onPrevious,
}: Step2Props) {
  const t = useTranslations("Dashboard.properties.addPropertyPage");
  const [fieldErrors, setFieldErrors] = useState<Step2FieldErrors>({});

  const selectClassName =
    "h-10.75! rounded-lg! border-[rgba(65,65,65,0.16)]! shadow-[0px_0px_10px_rgba(0,0,0,0.07)]!";

  const handleNext = () => {
    const errors: Step2FieldErrors = {};

    if (!formData.propertyTitle.trim()) {
      errors.propertyTitle = "propertyTitleRequired";
    }
    if (!formData.description.trim()) {
      errors.description = "descriptionRequired";
    }
    if (!formData.propertyCondition) {
      errors.propertyCondition = "propertyConditionRequired";
    }
    if (!formData.buildingHeight) {
      errors.buildingHeight = "buildingHeightRequired";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onNext();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onChange(e);
    const { name } = e.target;
    if (fieldErrors[name as keyof Step2FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const getError = (field: keyof Step2FieldErrors): string | undefined => {
    const errorKey = fieldErrors[field];
    if (!errorKey) return undefined;
    return t(`errors.${errorKey}`);
  };

  const conditionOptions = [
    { value: "fully_furnished", label: t("step2.conditionOptions.fullyFurnished") },
    { value: "partially_furnished", label: t("step2.conditionOptions.partiallyFurnished") },
    { value: "unfurnished", label: t("step2.conditionOptions.unfurnished") },
  ];

  const heightOptions = [
    { value: "high_rise", label: t("step2.heightOptions.highRise") },
    { value: "mid_rise", label: t("step2.heightOptions.midRise") },
    { value: "low_rise", label: t("step2.heightOptions.lowRise") },
  ];

  const buildingOptions = [
    { key: "buildingA", value: "Building A" },
    { key: "buildingB", value: "Building B" },
    { key: "buildingC", value: "Building C" },
    { key: "buildingD", value: "Building D" },
    { key: "buildingE", value: "Building E" },
    { key: "custom", value: "custom" },
  ];

  const bedroomOptions = ["Studio", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <>
      <h2 className="text-base lg:text-lg font-medium capitalize text-heading">
        {t("step2.sectionTitle")}
      </h2>

      <div className="w-full flex flex-col gap-4 lg:gap-5">
        {/* Property Title — full width */}
        <OnboardingField
          label={t("step2.propertyTitle")}
          name="propertyTitle"
          value={formData.propertyTitle}
          onChange={handleChange}
          error={getError("propertyTitle")}
        />

        {/* Description — full width textarea */}
        <div className="flex flex-col gap-1">
          <label className="text-sm lg:text-base text-text-muted font-normal leading-4.75">
            {t("step2.description")}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t("step2.descriptionPlaceholder")}
            rows={5}
            className={`w-full px-5 py-3 border rounded-lg text-sm font-medium text-text placeholder:text-[rgba(65,65,65,0.6)] shadow-[0px_0px_10px_rgba(0,0,0,0.07)] bg-white focus:outline-none focus:border-primary resize-y ${
              getError("description")
                ? "border-error"
                : "border-[rgba(65,65,65,0.16)]"
            }`}
          />
          {getError("description") && (
            <span className="text-xs text-error">{getError("description")}</span>
          )}
        </div>

        {/* Row: Bedrooms / Bathrooms */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <CounterField
            label={t("step2.bedrooms")}
            value={formData.bedrooms}
            onChange={(val) => onFormDataChange({ bedrooms: val })}
            min={0}
            max={20}
            step={1}
          />
          <CounterField
            label={t("step2.bathrooms")}
            value={formData.bathrooms}
            onChange={(val) => onFormDataChange({ bathrooms: val })}
            min={1}
            max={20}
            step={0.5}
          />
        </div>

        {/* Row: Unit Area / Unit Number */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm lg:text-base text-text-muted font-normal leading-4.75">
              {t("step2.unitArea")}
            </label>
            <div className="flex">
              <input
                type="number"
                name="unitArea"
                value={formData.unitArea}
                onChange={handleChange}
                className="flex-1 h-10.75 px-5 border border-r-0 rounded-l-lg text-sm font-medium text-text placeholder:text-[rgba(65,65,65,0.6)] shadow-[0px_0px_10px_rgba(0,0,0,0.07)] bg-white focus:outline-none focus:border-primary border-[rgba(65,65,65,0.16)]"
              />
              <select
                name="unitAreaUnit"
                value={formData.unitAreaUnit}
                onChange={handleChange}
                className="h-10.75 px-3 border rounded-r-lg text-sm font-medium text-text bg-primary-light appearance-none cursor-pointer focus:outline-none border-[rgba(65,65,65,0.16)]"
              >
                <option value="sqm">{t("step2.areaUnits.sqm")}</option>
                <option value="sqw">{t("step2.areaUnits.sqw")}</option>
                <option value="sqft">{t("step2.areaUnits.sqft")}</option>
              </select>
            </div>
          </div>
          <OnboardingField
            label={t("step2.unitNumber")}
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
            placeholder={t("step2.unitNumberPlaceholder")}
          />
        </div>

        {/* Row: Property Condition / Building Height */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <Select
              label={t("step2.propertyCondition")}
              name="propertyCondition"
              value={formData.propertyCondition}
              onChange={handleChange}
              options={conditionOptions}
              placeholder={t("selectPlaceholder")}
              error={getError("propertyCondition")}
              className={selectClassName}
            />
          </div>
          <div className="flex-1">
            <Select
              label={t("step2.buildingHeight")}
              name="buildingHeight"
              value={formData.buildingHeight}
              onChange={handleChange}
              options={heightOptions}
              placeholder={t("selectPlaceholder")}
              error={getError("buildingHeight")}
              className={selectClassName}
            />
          </div>
        </div>

        {/* Floor counter */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <CounterField
            label={t("step2.floor")}
            value={formData.floor}
            onChange={(val) => onFormDataChange({ floor: val })}
            min={1}
            max={99}
            step={1}
          />
          <div className="flex-1" />
        </div>

        {/* Select Building — radio buttons */}
        <div className="flex flex-col gap-2">
          <label className="text-sm lg:text-base text-text-muted font-normal leading-4.75">
            {t("step2.selectBuilding")}
          </label>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {buildingOptions.map((option) => (
              <label
                key={option.key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="selectBuilding"
                  value={option.value}
                  checked={formData.selectBuilding === option.value}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
                <span className="text-sm text-heading">
                  {t(`step2.buildingOptions.${option.key}`)}
                </span>
              </label>
            ))}
          </div>

          {/* Custom building name input */}
          {formData.selectBuilding === "custom" && (
            <div className="mt-2">
              <OnboardingField
                label=""
                name="customBuilding"
                value={formData.customBuilding}
                onChange={handleChange}
                placeholder={t("step2.customBuildingPlaceholder")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="w-full flex justify-end gap-3">
        <button
          type="button"
          onClick={onPrevious}
          className="px-5 py-2.5 bg-[rgba(124,132,141,0.7)] text-white text-base font-medium rounded hover:bg-[rgba(124,132,141,0.9)] transition-colors"
        >
          {t("previous")}
        </button>
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
