"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Select, Checkbox } from "@/components/ui";
import OnboardingField from "./OnboardingField";
import { OnboardingData } from "@/types/onboarding";
import {
  validateStep1,
  Step1FieldErrors,
} from "@/lib/validations/service-provider";

interface Step1Props {
  formData: OnboardingData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onNext: () => void;
}

export default function Step1BasicInfo({
  formData,
  onChange,
  onNext,
}: Step1Props) {
  const t = useTranslations("ServiceProviderOnboarding");
  const [fieldErrors, setFieldErrors] = useState<Step1FieldErrors>({});
  const [licenseFileName, setLicenseFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    const errors = validateStep1({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      experienceLevel: formData.experienceLevel,
      serviceType: formData.serviceType,
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
    onChange(e);
    const { name } = e.target;
    if (fieldErrors[name as keyof Step1FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLicenseFileName(file?.name || "");
    // Trigger a synthetic change for the parent
    onChange({
      target: { name: "licenseFile", value: file, type: "file" },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const getError = (field: keyof Step1FieldErrors): string | undefined => {
    const errorKey = fieldErrors[field];
    if (!errorKey) return undefined;
    return t(`errors.${errorKey}`);
  };

  const experienceOptions = [
    { value: "entry", label: t("step1.experienceEntry") },
    { value: "intermediate", label: t("step1.experienceIntermediate") },
    { value: "expert", label: t("step1.experienceExpert") },
  ];

  const serviceTypeOptions = [
    { value: "property_inspection", label: t("step1.servicePropertyInspection") },
    { value: "showing_agent", label: t("step1.serviceShowingAgent") },
  ];

  return (
    <>
      <h2 className="text-base lg:text-lg font-medium capitalize text-[#32343C]">
        {t("step1.sectionTitle")}
      </h2>

      <div className="w-full flex flex-col gap-4 lg:gap-5">
        {/* Row: First Name / Last Name */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <OnboardingField
            label={t("step1.firstName")}
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="name"
            error={getError("firstName")}
          />
          <OnboardingField
            label={t("step1.lastName")}
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="name"
            error={getError("lastName")}
          />
        </div>

        {/* Row: Email / Phone (read-only, carried from signup) */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <OnboardingField
            label={t("step1.emailAddress")}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="@gmail.com"
            readOnly
          />
          <OnboardingField
            label={t("step1.phoneNumber")}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="000 0000 0000"
            type="tel"
            readOnly
          />
        </div>

        {/* Row: Experience Level / Service Type */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <Select
              label={t("step1.experienceLevel")}
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              options={experienceOptions}
              placeholder={t("step1.selectPlaceholder")}
              error={getError("experienceLevel")}
              className="h-10.75! rounded-lg! border-[rgba(65,65,65,0.16)]! shadow-[0px_0px_10px_rgba(0,0,0,0.07)]!"
            />
          </div>
          <div className="flex-1">
            <Select
              label={t("step1.serviceType")}
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              options={serviceTypeOptions}
              placeholder={t("step1.selectPlaceholder")}
              error={getError("serviceType")}
              className="h-10.75! rounded-lg! border-[rgba(65,65,65,0.16)]! shadow-[0px_0px_10px_rgba(0,0,0,0.07)]!"
            />
          </div>
        </div>

        {/* Upload License/Certification */}
        <div className="w-full border border-dashed border-[rgba(50,52,60,0.5)] rounded-[7.5px] flex flex-col items-center py-3.5 px-4 lg:px-18.5 gap-3">
          <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 17.5L12.5 13.5L8.5 17.5" stroke="#0245A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.5 13.5V22.5" stroke="#0245A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.4 20.4C21.3604 19.8839 22.1174 19.0665 22.5579 18.07C22.9984 17.0735 23.0984 15.955 22.842 14.8948C22.5857 13.8346 21.9874 12.894 21.1396 12.2123C20.2918 11.5306 19.2415 11.146 18.15 11.12H16.87C16.5782 9.96232 16.0362 8.88442 15.2817 7.96263C14.5272 7.04084 13.5784 6.29807 12.5014 5.78726C11.4245 5.27645 10.2472 5.01064 9.05531 5.00905C7.86336 5.00746 6.68532 5.27014 5.60692 5.77807C4.52852 6.286 3.57754 7.02622 2.82037 7.94603C2.0632 8.86584 1.5182 9.94241 1.22363 11.0993C0.929067 12.2562 0.892289 13.4646 1.11585 14.6377C1.33941 15.8109 1.81789 16.9194 2.51717 17.8833" stroke="#0245A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <span className="text-xs text-[#32343C] text-center">
            {licenseFileName || t("step1.uploadTitle")}
          </span>

          <div className="flex items-center gap-2">
            <Checkbox
              name="hasNoLicense"
              checked={formData.hasNoLicense}
              onChange={handleChange}
              label={
                <span className="text-[10px] text-[rgba(50,52,60,0.7)]">
                  {t("step1.noLicense")}
                </span>
              }
            />
          </div>

          {/* TODO: Implement actual file upload to storage */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={formData.hasNoLicense}
            className="px-5 py-1 bg-[#0245A5] text-white text-sm font-medium rounded disabled:opacity-50 transition-colors hover:bg-[#023a8a]"
          >
            {t("step1.browse")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
          {licenseFileName && (
            <span className="text-[10px] text-[rgba(50,52,60,0.7)]">
              Selected: {licenseFileName} (upload not connected yet)
            </span>
          )}
        </div>
      </div>

      {/* Next button */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2.5 bg-[#0245A5] text-white text-base font-medium rounded hover:bg-[#023a8a] transition-colors"
        >
          {t("step1.next")}
        </button>
      </div>
    </>
  );
}
