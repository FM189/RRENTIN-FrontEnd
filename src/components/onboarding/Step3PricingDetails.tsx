"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import OnboardingField from "./OnboardingField";
import { OnboardingData } from "@/types/onboarding";
import {
  validateStep3,
  Step3FieldErrors,
} from "@/lib/validations/service-provider";

interface Step3Props {
  formData: OnboardingData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitError?: string;
}

export default function Step3PricingDetails({
  formData,
  onChange,
  onPrevious,
  onSubmit,
  isSubmitting = false,
  submitError,
}: Step3Props) {
  const t = useTranslations("ServiceProviderOnboarding");
  const [fieldErrors, setFieldErrors] = useState<Step3FieldErrors>({});

  const handleSubmit = () => {
    const errors = validateStep3({
      serviceType: formData.serviceType,
      showingBasePrice: formData.showingBasePrice,
      inspectionBasePrice: formData.inspectionBasePrice,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onSubmit();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onChange(e);
    const { name } = e.target;
    if (fieldErrors[name as keyof Step3FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const getError = (field: keyof Step3FieldErrors): string | undefined => {
    const errorKey = fieldErrors[field];
    if (!errorKey) return undefined;
    return t(`errors.${errorKey}`);
  };

  return (
    <>
      <h2 className="text-base lg:text-lg font-medium capitalize text-[#32343C]">
        {t("step3.sectionTitle")}
      </h2>

      <div className="w-full flex flex-col gap-4 lg:gap-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          {formData.serviceType === "showing_agent" && (
            <OnboardingField
              label={t("step3.showingBasePrice")}
              name="showingBasePrice"
              type="number"
              value={formData.showingBasePrice}
              onChange={handleChange}
              placeholder={t("step3.enterFees")}
              error={getError("showingBasePrice")}
            />
          )}

          {formData.serviceType === "property_inspection" && (
            <OnboardingField
              label={t("step3.inspectionBasePrice")}
              name="inspectionBasePrice"
              type="number"
              value={formData.inspectionBasePrice}
              onChange={handleChange}
              placeholder={t("step3.enterFees")}
              error={getError("inspectionBasePrice")}
            />
          )}
        </div>
      </div>

      {submitError && (
        <p className="w-full text-sm text-error">{submitError}</p>
      )}

      {/* Navigation buttons */}
      <div className="w-full flex justify-end gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-[rgba(124,132,141,0.7)] text-white text-base font-medium rounded hover:bg-[rgba(124,132,141,0.9)] transition-colors disabled:opacity-50"
        >
          {t("step3.previous")}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-[#0245A5] text-white text-base font-medium rounded hover:bg-[#023a8a] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "..." : t("step3.signup")}
        </button>
      </div>
    </>
  );
}
