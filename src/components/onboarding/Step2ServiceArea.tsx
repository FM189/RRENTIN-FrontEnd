"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Country, State, City } from "country-state-city";
import { Select } from "@/components/ui";
import OnboardingField from "./OnboardingField";
import { OnboardingData } from "@/types/onboarding";
import {
  validateStep2,
  Step2FieldErrors,
} from "@/lib/validations/service-provider";

interface Step2Props {
  formData: OnboardingData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step2ServiceArea({
  formData,
  onChange,
  onNext,
  onPrevious,
}: Step2Props) {
  const t = useTranslations("ServiceProviderOnboarding");
  const [fieldErrors, setFieldErrors] = useState<Step2FieldErrors>({});

  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        value: c.isoCode,
        label: c.name,
      })),
    []
  );

  const stateOptions = useMemo(() => {
    if (!formData.country) return [];
    return State.getStatesOfCountry(formData.country).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));
  }, [formData.country]);

  const cityOptions = useMemo(() => {
    if (!formData.country || !formData.stateProvince) return [];
    return City.getCitiesOfState(formData.country, formData.stateProvince).map(
      (c) => ({
        value: c.name,
        label: c.name,
      })
    );
  }, [formData.country, formData.stateProvince]);

  const availableDaysOptions = [
    { value: "mon_fri", label: t("step2.dayMonFri") },
    { value: "sat_sun", label: t("step2.daySatSun") },
    { value: "all_week", label: t("step2.dayAllWeek") },
    { value: "custom", label: t("step2.dayCustom") },
  ];

  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  const handleNext = () => {
    const errors = validateStep2({
      country: formData.country,
      stateProvince: formData.stateProvince,
      city: formData.city,
      area: formData.area,
      availableDays: formData.availableDays,
      availableHoursOpen: formData.availableHoursOpen,
      availableHoursClose: formData.availableHoursClose,
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
    if (name === "country") {
      const clearEvent = (field: string) =>
        onChange({
          target: { name: field, value: "", type: "select-one" },
        } as React.ChangeEvent<HTMLSelectElement>);
      clearEvent("stateProvince");
      clearEvent("city");
    } else if (name === "stateProvince") {
      onChange({
        target: { name: "city", value: "", type: "select-one" },
      } as React.ChangeEvent<HTMLSelectElement>);
    }

    if (fieldErrors[name as keyof Step2FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const getError = (field: keyof Step2FieldErrors): string | undefined => {
    const errorKey = fieldErrors[field];
    if (!errorKey) return undefined;
    return t(`errors.${errorKey}`);
  };

  const selectClassName =
    "h-10.75! rounded-lg! border-[rgba(65,65,65,0.16)]! shadow-[0px_0px_10px_rgba(0,0,0,0.07)]!";

  return (
    <>
      <h2 className="text-base lg:text-lg font-medium capitalize text-[#32343C]">
        {t("step2.sectionTitle")}
      </h2>

      <div className="w-full flex flex-col gap-4 lg:gap-5">
        {/* Row: Country / State/Province */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <Select
              label={t("step2.country")}
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={countryOptions}
              placeholder={t("step2.selectPlaceholder")}
              error={getError("country")}
              className={selectClassName}
            />
          </div>
          <div className="flex-1">
            <Select
              label={t("step2.stateProvince")}
              name="stateProvince"
              value={formData.stateProvince}
              onChange={handleChange}
              options={stateOptions}
              placeholder={t("step2.selectPlaceholder")}
              error={getError("stateProvince")}
              className={selectClassName}
            />
          </div>
        </div>

        {/* Row: City / Area */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <Select
              label={t("step2.city")}
              name="city"
              value={formData.city}
              onChange={handleChange}
              options={cityOptions}
              placeholder={t("step2.selectPlaceholder")}
              error={getError("city")}
              className={selectClassName}
            />
          </div>
          <OnboardingField
            label={t("step2.area")}
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder={t("step2.areaPlaceholder")}
            error={getError("area")}
            rightIcon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
                  stroke="#74757B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.75 15.75L12.4875 12.4875"
                  stroke="#74757B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </div>

        {/* Row: Available Days / Available Hours */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <Select
              label={t("step2.availableDays")}
              name="availableDays"
              value={formData.availableDays}
              onChange={handleChange}
              options={availableDaysOptions}
              placeholder={t("step2.selectPlaceholder")}
              error={getError("availableDays")}
              className={selectClassName}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm lg:text-base text-text-muted font-normal leading-4.75">
              {t("step2.availableHours")}
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  name="availableHoursOpen"
                  value={formData.availableHoursOpen}
                  onChange={handleChange}
                  options={hourOptions}
                  placeholder={t("step2.openAt")}
                  error={getError("availableHoursOpen")}
                  className={selectClassName}
                />
              </div>
              <div className="flex-1">
                <Select
                  name="availableHoursClose"
                  value={formData.availableHoursClose}
                  onChange={handleChange}
                  options={hourOptions}
                  placeholder={t("step2.closeAt")}
                  error={getError("availableHoursClose")}
                  className={selectClassName}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="w-full flex justify-end gap-3">
        <button
          type="button"
          onClick={onPrevious}
          className="px-5 py-2.5 bg-[rgba(124,132,141,0.7)] text-white text-base font-medium rounded hover:bg-[rgba(124,132,141,0.9)] transition-colors"
        >
          {t("step2.previous")}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2.5 bg-[#0245A5] text-white text-base font-medium rounded hover:bg-[#023a8a] transition-colors"
        >
          {t("step2.next")}
        </button>
      </div>
    </>
  );
}
