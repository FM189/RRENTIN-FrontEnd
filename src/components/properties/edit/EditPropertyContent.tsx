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
  EditPropertyFiles,
  PropertyFiles,
} from "@/types/property";
import { PropertyForEdit } from "@/actions/properties";
import { getAccessToken } from "@/actions/cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface EditPropertyContentProps {
  property: PropertyForEdit;
}

export default function EditPropertyContent({ property }: EditPropertyContentProps) {
  const t      = useTranslations("Dashboard.properties.addPropertyPage");
  const router = useRouter();

  const [currentStep,  setCurrentStep]  = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState("");

  // Pre-populate form data from existing property
  const [formData, setFormData] = useState<AddPropertyData>({
    propertyType:        property.propertyType,
    projectName:         property.projectName,
    address:             property.address,
    road:                property.road,
    province:            property.province,
    district:            property.district,
    subDistrict:         property.subDistrict,
    zipCode:             property.zipCode,
    country:             property.country,
    propertyStatus:      property.propertyStatus,
    showingDates:        property.showingDates,
    showingTimeFrom:     property.showingTimeFrom,
    showingTimeTo:       property.showingTimeTo,
    location:            property.location,
    propertyTitle:       property.propertyTitle,
    description:         property.description,
    bedrooms:            property.bedrooms,
    bathrooms:           property.bathrooms,
    unitArea:            property.unitArea,
    unitAreaUnit:        property.unitAreaUnit,
    unitNumber:          property.unitNumber,
    propertyCondition:   property.propertyCondition,
    buildingHeight:      property.buildingHeight,
    floor:               property.floor,
    selectBuilding:      property.selectBuilding,
    customBuilding:      property.customBuilding,
    propertyFeatures:    property.propertyFeatures,
    amenities:           property.amenities,
    securityFeatures:    property.securityFeatures,
    rentalFeatures:      property.rentalFeatures,
    propertyViews:       property.propertyViews,
    customFeatures:      property.customFeatures,
    customAmenities:     property.customAmenities,
    customSecurity:      property.customSecurity,
    customRentalFeatures: property.customRentalFeatures,
    customViews:         property.customViews,
    // Step 4 string fields (file arrays managed separately via editFiles)
    photos:              [],
    hasFloorPlan:        property.hasFloorPlan,
    floorPlanImages:     [],
    ownershipVerification: property.ownershipVerification,
    ownershipDocuments:  [],
    visitRequestPrice:   property.visitRequestPrice,
    propertyPrice:       property.propertyPrice,
    contracts:           property.contracts.length > 0
      ? property.contracts
      : [{ months: 1, rentPrice: "", securityDeposit: "" }],
    customFees:          property.customFees ?? [],
  });

  // Track existing S3 URLs and new File objects separately
  const [editFiles, setEditFiles] = useState<EditPropertyFiles>({
    newPhotos:          [],
    newFloorPlans:      [],
    newDocuments:       [],
    existingPhotos:     property.photos,
    existingFloorPlans: property.floorPlanImages,
    existingDocuments:  property.ownershipDocuments,
    deletedPhotos:      [],
    deletedFloorPlans:  [],
    deletedDocuments:   [],
  });

  // PropertyFiles wrapper for Step4Photos (new files only)
  const newFiles: PropertyFiles = {
    photos:     editFiles.newPhotos,
    floorPlans: editFiles.newFloorPlans,
    documents:  editFiles.newDocuments,
  };

  const handleNewFilesChange = (updates: Partial<PropertyFiles>) => {
    setEditFiles((prev) => ({
      ...prev,
      ...(updates.photos     !== undefined && { newPhotos:     updates.photos }),
      ...(updates.floorPlans !== undefined && { newFloorPlans: updates.floorPlans }),
      ...(updates.documents  !== undefined && { newDocuments:  updates.documents }),
    }));
  };

  const handleRemoveExisting = (
    type: "photos" | "floorPlans" | "documents",
    url: string
  ) => {
    setEditFiles((prev) => {
      if (type === "photos") {
        return {
          ...prev,
          existingPhotos:  prev.existingPhotos.filter((u) => u !== url),
          deletedPhotos:   [...prev.deletedPhotos, url],
        };
      }
      if (type === "floorPlans") {
        return {
          ...prev,
          existingFloorPlans: prev.existingFloorPlans.filter((u) => u !== url),
          deletedFloorPlans:  [...prev.deletedFloorPlans, url],
        };
      }
      return {
        ...prev,
        existingDocuments: prev.existingDocuments.filter((u) => u !== url),
        deletedDocuments:  [...prev.deletedDocuments, url],
      };
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormDataChange = (updates: Partial<AddPropertyData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const stepLabels = [
    t("steps.basicInfo"),
    t("steps.propertyInfo"),
    t("steps.featureAmenities"),
    t("steps.photos"),
    t("steps.pricing"),
  ];

  // ── Submit: upload new files → update property ─────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = await getAccessToken();
      const authHeader: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      // Upload only new files
      let newPhotoUrls:     string[] = [];
      let newFloorPlanUrls: string[] = [];
      let newDocumentUrls:  string[] = [];

      const hasNewFiles =
        editFiles.newPhotos.length > 0 ||
        editFiles.newFloorPlans.length > 0 ||
        editFiles.newDocuments.length > 0;

      if (hasNewFiles) {
        const fd = new FormData();
        editFiles.newPhotos.forEach((f)     => fd.append("photos",     f));
        editFiles.newFloorPlans.forEach((f) => fd.append("floorPlans", f));
        editFiles.newDocuments.forEach((f)  => fd.append("documents",  f));

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
          } catch { /* use default */ }
          throw new Error(message);
        }

        const uploadData = await uploadRes.json() as {
          data: { photos?: string[]; floorPlans?: string[]; documents?: string[] };
        };
        newPhotoUrls     = uploadData.data.photos     ?? [];
        newFloorPlanUrls = uploadData.data.floorPlans ?? [];
        newDocumentUrls  = uploadData.data.documents  ?? [];
      }

      const stripSentinel = (arr: string[]) => arr.filter((v) => v !== "add_others");

      const payload = {
        ...formData,
        propertyFeatures:  stripSentinel(formData.propertyFeatures),
        amenities:         stripSentinel(formData.amenities),
        securityFeatures:  stripSentinel(formData.securityFeatures),
        rentalFeatures:    stripSentinel(formData.rentalFeatures),
        propertyViews:     stripSentinel(formData.propertyViews),
        // Final arrays: kept existing + newly uploaded
        photos:             [...editFiles.existingPhotos, ...newPhotoUrls],
        floorPlanImages:    [...editFiles.existingFloorPlans, ...newFloorPlanUrls],
        ownershipDocuments: [...editFiles.existingDocuments, ...newDocumentUrls],
        // Deleted URLs for backend to remove from S3
        deletedPhotos:             editFiles.deletedPhotos,
        deletedFloorPlanImages:    editFiles.deletedFloorPlans,
        deletedOwnershipDocuments: editFiles.deletedDocuments,
      };

      const updateRes = await fetch(`${API_BASE}/properties/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(payload),
      });

      if (!updateRes.ok) {
        let message = "Failed to update property. Please try again.";
        try {
          const err = await updateRes.json() as { message?: string };
          if (err.message) message = err.message;
        } catch { /* use default */ }
        throw new Error(message);
      }

      router.push(`/dashboard/owner/properties/${property.id}`);
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
      <h1 className="text-lg lg:text-[22px] font-semibold leading-6.5 capitalize text-heading">
        {t("editPageTitle")}
      </h1>

      <Stepper steps={stepLabels} currentStep={currentStep} />

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
          files={newFiles}
          onFilesChange={handleNewFilesChange}
          existingPhotos={editFiles.existingPhotos}
          existingFloorPlans={editFiles.existingFloorPlans}
          existingDocuments={editFiles.existingDocuments}
          onRemoveExisting={handleRemoveExisting}
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
          submitLabel={t("step5.updateProperty")}
        />
      )}
    </div>
  );
}
