"use client";

import { useTranslations } from "next-intl";
import { AddPropertyData } from "@/types/property";

interface Step4Props {
  formData: AddPropertyData;
  onFormDataChange: (updates: Partial<AddPropertyData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

function UploadArea({ text, subText }: { text: string; subText?: string }) {
  return (
    <div className="w-full border-2 border-dashed border-primary/40 rounded-lg py-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/70 hover:bg-primary/[0.02] transition-colors">
      <img
        src="/images/icons/dashboard/property/upload.png"
        alt="Upload"
        className="w-10 h-10 object-contain"
      />
      <span className="text-sm text-primary font-medium">{text}</span>
      {subText && (
        <span className="text-xs text-text-muted">{subText}</span>
      )}
    </div>
  );
}

export default function Step4Photos({
  formData,
  onFormDataChange,
  onNext,
  onPrevious,
}: Step4Props) {
  const t = useTranslations("Dashboard.properties.addPropertyPage");

  const verificationOptions = [
    { value: "land_title_deed", label: t("step4.verificationOptions.land_title_deed") },
    { value: "purchase_contract", label: t("step4.verificationOptions.purchase_contract") },
    { value: "utility_bill", label: t("step4.verificationOptions.utility_bill") },
  ];

  return (
    <>
      <h2 className="text-base lg:text-lg font-medium capitalize text-heading">
        {t("step4.sectionTitle")}
      </h2>

      <div className="w-full flex flex-col gap-5 lg:gap-6">
        {/* Property Images */}
        <div className="flex flex-col gap-2">
          <label className="text-sm lg:text-base font-semibold text-heading">
            {t("step4.propertyImages")}
            <span className="text-error"> *</span>
            <span className="text-text-muted font-normal text-xs lg:text-sm ml-2">
              {t("step4.minimumImages")}
            </span>
          </label>
          <UploadArea
            text={t("step4.clickOrDrag")}
            subText={t("step4.uploaded", { count: formData.photos.length })}
          />
        </div>

        {/* Floor Plan Toggle */}
        <div>
          <button
            type="button"
            onClick={() =>
              onFormDataChange({ hasFloorPlan: !formData.hasFloorPlan })
            }
            className="px-5 py-2.5 text-sm font-medium rounded-full bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            {t("step4.iHaveFloorPlan")}
          </button>
        </div>

        {/* Floor Plan Upload (conditional) */}
        {formData.hasFloorPlan && (
          <div className="flex flex-col gap-2">
            <label className="text-sm lg:text-base font-semibold text-heading">
              {t("step4.floorPlanImages")}
              <span className="text-error"> *</span>
            </label>
            <UploadArea text={t("step4.clickOrDrag")} />
          </div>
        )}

        {/* Ownership Verification */}
        <div className="flex flex-col gap-3">
          <label className="text-sm lg:text-base font-semibold text-heading">
            {t("step4.ownershipVerification")}
            <span className="text-error"> *</span>
          </label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {verificationOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="ownershipVerification"
                  value={option.value}
                  checked={formData.ownershipVerification === option.value}
                  onChange={() =>
                    onFormDataChange({ ownershipVerification: option.value })
                  }
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span className="text-sm text-heading">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ownership Document Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm lg:text-base font-semibold text-heading">
            {t("step4.ownershipDocument")}
            <span className="text-error"> *</span>
          </label>
          <UploadArea text={t("step4.clickOrDrag")} />
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
          onClick={onNext}
          className="px-5 py-2.5 bg-primary text-white text-base font-medium rounded hover:bg-primary-hover transition-colors"
        >
          {t("next")}
        </button>
      </div>
    </>
  );
}
