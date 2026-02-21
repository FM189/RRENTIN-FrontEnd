"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  PropertyFiles,
  INITIAL_PROPERTY_FILES,
} from "@/types/property";
import { getAccessToken } from "@/actions/cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AddPropertyPage() {
  const t      = useTranslations("Dashboard.properties.addPropertyPage");
  const router = useRouter();

  const [currentStep,  setCurrentStep]  = useState(1);
  const [formData,     setFormData]     = useState<AddPropertyData>(INITIAL_ADD_PROPERTY_DATA);
  const [propertyFiles, setPropertyFiles] = useState<PropertyFiles>(INITIAL_PROPERTY_FILES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState("");

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

  const handleFilesChange = (updates: Partial<PropertyFiles>) => {
    setPropertyFiles((prev) => ({ ...prev, ...updates }));
  };

  // ── Submit: upload files → create property ─────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Get auth token
      const token = await getAccessToken();
      const authHeader: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      // Step 1: Upload files to S3 if any were selected
      let photoUrls:     string[] = [];
      let floorPlanUrls: string[] = [];
      let documentUrls:  string[] = [];

      const hasFiles =
        propertyFiles.photos.length > 0 ||
        propertyFiles.floorPlans.length > 0 ||
        propertyFiles.documents.length > 0;

      if (hasFiles) {
        const fd = new FormData();
        propertyFiles.photos.forEach((f)     => fd.append("photos",     f));
        propertyFiles.floorPlans.forEach((f)  => fd.append("floorPlans", f));
        propertyFiles.documents.forEach((f)   => fd.append("documents",  f));

        const uploadRes = await fetch(`${API_BASE}/properties/upload`, {
          method: "POST",
          headers: { ...authHeader },
          body: fd,
        });

        if (!uploadRes.ok) {
          let message = "File upload failed. Please try again.";
          try {
            const err = await uploadRes.json() as { message?: string };
            if (err.message) message = err.message;
          } catch { /* use default message */ }
          throw new Error(message);
        }

        const uploadData = await uploadRes.json() as {
          data: { photos?: string[]; floorPlans?: string[]; documents?: string[] };
        };
        photoUrls     = uploadData.data.photos     ?? [];
        floorPlanUrls = uploadData.data.floorPlans ?? [];
        documentUrls  = uploadData.data.documents  ?? [];
      }

      // Step 2: Create property with all form data + S3 URLs
      // Strip the "add_others" sentinel value from all predefined feature arrays
      const stripSentinel = (arr: string[]) => arr.filter((v) => v !== "add_others");

      const payload = {
        ...formData,
        propertyFeatures:  stripSentinel(formData.propertyFeatures),
        amenities:         stripSentinel(formData.amenities),
        securityFeatures:  stripSentinel(formData.securityFeatures),
        rentalFeatures:    stripSentinel(formData.rentalFeatures),
        propertyViews:     stripSentinel(formData.propertyViews),
        photos:             photoUrls,
        floorPlanImages:    floorPlanUrls,
        ownershipDocuments: documentUrls,
      };

      const createRes = await fetch(`${API_BASE}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) {
        let message = "Failed to create property. Please try again.";
        try {
          const err = await createRes.json() as { message?: string };
          if (err.message) message = err.message;
        } catch { /* use default message */ }
        throw new Error(message);
      }

      // Step 3: Redirect to properties list on success
      router.push("/dashboard/owner/properties");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
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
          files={propertyFiles}
          onFilesChange={handleFilesChange}
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
