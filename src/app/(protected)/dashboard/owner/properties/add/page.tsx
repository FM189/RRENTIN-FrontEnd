"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Stepper } from "@/components/ui";
import Step1BasicInfo from "@/components/add-property/Step1BasicInfo";
import Step2PropertyInfo from "@/components/add-property/Step2PropertyInfo";
import Step3FeatureAmenities from "@/components/add-property/Step3FeatureAmenities";
import Step4Photos from "@/components/add-property/Step4Photos";
import Step5Pricing from "@/components/add-property/Step5Pricing";
import {
  AddPropertyData,
  INITIAL_ADD_PROPERTY_DATA,
} from "@/types/property";

export default function AddPropertyPage() {
  const t = useTranslations("Dashboard.properties.addPropertyPage");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AddPropertyData>(
    INITIAL_ADD_PROPERTY_DATA
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const stepLabels = [
    t("steps.basicInfo"),
    t("steps.propertyInfo"),
    t("steps.featureAmenities"),
    t("steps.photos"),
    t("steps.pricing"),
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormDataChange = (updates: Partial<AddPropertyData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    // TODO: Implement property submission API call
    try {
      // Placeholder for API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // On success, redirect to properties list
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[10px] shadow-[0px_0px_14px_rgba(0,0,0,0.09)] flex flex-col items-center px-4 sm:px-6 lg:px-10 py-6 lg:py-7.5 gap-5 lg:gap-6">
      {/* Title */}
      <h1 className="text-lg lg:text-[22px] font-semibold leading-6.5 capitalize text-heading">
        {t("pageTitle")}
      </h1>

      {/* Stepper */}
      <Stepper steps={stepLabels} currentStep={currentStep} />

      {/* Step Content */}
      {currentStep === 1 && (
        <Step1BasicInfo
          formData={formData}
          onChange={handleInputChange}
          onFormDataChange={handleFormDataChange}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <Step2PropertyInfo
          formData={formData}
          onChange={handleInputChange}
          onFormDataChange={handleFormDataChange}
          onNext={() => setCurrentStep(3)}
          onPrevious={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <Step3FeatureAmenities
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onNext={() => setCurrentStep(4)}
          onPrevious={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && (
        <Step4Photos
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onNext={() => setCurrentStep(5)}
          onPrevious={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 5 && (
        <Step5Pricing
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onChange={handleInputChange}
          onPrevious={() => setCurrentStep(4)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}
    </div>
  );
}
