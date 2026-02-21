"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AddPropertyData, PropertyFiles } from "@/types/property";

const IMAGE_TYPES   = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DOCUMENT_TYPES = [...IMAGE_TYPES, "application/pdf"];
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;   // 5 MB
const DOC_MAX_BYTES   = 10 * 1024 * 1024;  // 10 MB

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilePreview {
  file: File;
  previewUrl: string;
  error?: string;
}

interface Step4Props {
  formData: AddPropertyData;
  onFormDataChange: (updates: Partial<AddPropertyData>) => void;
  files: PropertyFiles;
  onFilesChange: (updates: Partial<PropertyFiles>) => void;
  onNext: () => void;
  onPrevious: () => void;
  // Edit mode: pre-existing S3 URLs
  existingPhotos?: string[];
  existingFloorPlans?: string[];
  existingDocuments?: string[];
  onRemoveExisting?: (type: "photos" | "floorPlans" | "documents", url: string) => void;
}

// ─── UploadZone ───────────────────────────────────────────────────────────────

function UploadZone({
  accept, multiple, text, subText, onFiles,
}: {
  accept: string;
  multiple: boolean;
  text: string;
  subText?: string;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) onFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="w-full border-2 border-dashed border-primary/40 rounded-lg py-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/70 hover:bg-primary/[0.02] transition-colors"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <img
        src="/images/icons/dashboard/property/upload.png"
        alt="Upload"
        className="w-10 h-10 object-contain"
      />
      <span className="text-sm text-primary font-medium">{text}</span>
      {subText && <span className="text-xs text-text-muted">{subText}</span>}
    </div>
  );
}

// ─── PreviewGrid ──────────────────────────────────────────────────────────────

function PreviewGrid({
  previews, onRemove,
}: {
  previews: FilePreview[];
  onRemove: (index: number) => void;
}) {
  if (previews.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {previews.map((preview, index) => (
        <div
          key={index}
          className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0"
        >
          {preview.file.type === "application/pdf" ? (
            <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] text-gray-500 break-all line-clamp-2">{preview.file.name}</span>
            </div>
          ) : (
            <img
              src={preview.previewUrl}
              alt={preview.file.name}
              className="w-full h-full object-cover"
            />
          )}

          {/* Error overlay */}
          {preview.error && (
            <div className="absolute inset-0 bg-red-500/20 flex items-end justify-center pb-1 px-1">
              <span className="text-[9px] text-red-700 text-center font-medium leading-tight bg-white/80 rounded px-1">
                {preview.error}
              </span>
            </div>
          )}

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── ExistingPreviewGrid (edit mode) ──────────────────────────────────────────

function ExistingPreviewGrid({
  urls,
  onRemove,
}: {
  urls: string[];
  onRemove: (url: string) => void;
}) {
  if (urls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {urls.map((url) => {
        const isPdf = url.toLowerCase().endsWith(".pdf");
        return (
          <div
            key={url}
            className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isPdf ? (
                <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2v6h6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[10px] text-gray-500">PDF</span>
                </div>
              ) : (
                <img src={url} alt="Existing" className="w-full h-full object-cover" />
              )}
            </a>
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Step4Photos({
  formData, onFormDataChange,
  files, onFilesChange,
  onNext, onPrevious,
  existingPhotos = [],
  existingFloorPlans = [],
  existingDocuments = [],
  onRemoveExisting,
}: Step4Props) {
  const t = useTranslations("Dashboard.properties.addPropertyPage");

  const [photoPreviews,     setPhotoPreviews]     = useState<FilePreview[]>([]);
  const [floorPlanPreviews, setFloorPlanPreviews] = useState<FilePreview[]>([]);
  const [docPreviews,       setDocPreviews]       = useState<FilePreview[]>([]);
  const [step4Error,        setStep4Error]        = useState("");

  const verificationOptions = [
    { value: "land_title_deed",   label: t("step4.verificationOptions.land_title_deed") },
    { value: "purchase_contract", label: t("step4.verificationOptions.purchase_contract") },
    { value: "utility_bill",      label: t("step4.verificationOptions.utility_bill") },
  ];

  // ── Add files ─────────────────────────────────────────────────────────────

  function addFiles(
    newFiles: File[],
    allowedTypes: string[],
    maxBytes: number,
    setPreviews: React.Dispatch<React.SetStateAction<FilePreview[]>>,
    filesKey: keyof PropertyFiles,
  ) {
    const valid: FilePreview[]   = [];
    const invalid: FilePreview[] = [];

    for (const file of newFiles) {
      const previewUrl = URL.createObjectURL(file);
      if (!allowedTypes.includes(file.type)) {
        invalid.push({ file, previewUrl, error: t("step4.errors.invalidType") });
      } else if (file.size > maxBytes) {
        invalid.push({ file, previewUrl, error: t("step4.errors.tooLarge", { mb: maxBytes / 1024 / 1024 }) });
      } else {
        valid.push({ file, previewUrl });
      }
    }

    setPreviews((prev) => [...prev, ...valid, ...invalid]);

    if (valid.length > 0) {
      onFilesChange({ [filesKey]: [...files[filesKey], ...valid.map((p) => p.file)] });
    }
  }

  // ── Remove file ───────────────────────────────────────────────────────────

  function removeFile(
    index: number,
    previews: FilePreview[],
    setPreviews: React.Dispatch<React.SetStateAction<FilePreview[]>>,
    filesKey: keyof PropertyFiles,
  ) {
    const preview = previews[index];
    URL.revokeObjectURL(preview.previewUrl);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (!preview.error) {
      onFilesChange({ [filesKey]: files[filesKey].filter((f) => f !== preview.file) });
    }
  }

  // ── Validate before next ──────────────────────────────────────────────────

  const handleNext = () => {
    if (files.photos.length + existingPhotos.length === 0) {
      setStep4Error(t("step4.errors.photosRequired"));
      return;
    }
    if (!formData.ownershipVerification) {
      setStep4Error(t("step4.errors.verificationRequired"));
      return;
    }
    if (files.documents.length + existingDocuments.length === 0) {
      setStep4Error(t("step4.errors.documentsRequired"));
      return;
    }
    setStep4Error("");
    onNext();
  };

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
          <ExistingPreviewGrid
            urls={existingPhotos}
            onRemove={(url) => onRemoveExisting?.("photos", url)}
          />
          <UploadZone
            accept={IMAGE_TYPES.join(",")}
            multiple
            text={t("step4.clickOrDrag")}
            subText={t("step4.uploaded", { count: existingPhotos.length + files.photos.length })}
            onFiles={(f) => addFiles(f, IMAGE_TYPES, IMAGE_MAX_BYTES, setPhotoPreviews, "photos")}
          />
          <PreviewGrid
            previews={photoPreviews}
            onRemove={(i) => removeFile(i, photoPreviews, setPhotoPreviews, "photos")}
          />
        </div>

        {/* Floor Plan Toggle */}
        <div>
          <button
            type="button"
            onClick={() => onFormDataChange({ hasFloorPlan: !formData.hasFloorPlan })}
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${
              formData.hasFloorPlan
                ? "bg-primary-hover text-white"
                : "bg-primary text-white hover:bg-primary-hover"
            }`}
          >
            {t("step4.iHaveFloorPlan")}
          </button>
        </div>

        {/* Floor Plan Upload */}
        {formData.hasFloorPlan && (
          <div className="flex flex-col gap-2">
            <label className="text-sm lg:text-base font-semibold text-heading">
              {t("step4.floorPlanImages")}
              <span className="text-error"> *</span>
            </label>
            <ExistingPreviewGrid
              urls={existingFloorPlans}
              onRemove={(url) => onRemoveExisting?.("floorPlans", url)}
            />
            <UploadZone
              accept={IMAGE_TYPES.join(",")}
              multiple
              text={t("step4.clickOrDrag")}
              onFiles={(f) => addFiles(f, IMAGE_TYPES, IMAGE_MAX_BYTES, setFloorPlanPreviews, "floorPlans")}
            />
            <PreviewGrid
              previews={floorPlanPreviews}
              onRemove={(i) => removeFile(i, floorPlanPreviews, setFloorPlanPreviews, "floorPlans")}
            />
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
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ownershipVerification"
                  value={option.value}
                  checked={formData.ownershipVerification === option.value}
                  onChange={() => onFormDataChange({ ownershipVerification: option.value })}
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
          <ExistingPreviewGrid
            urls={existingDocuments}
            onRemove={(url) => onRemoveExisting?.("documents", url)}
          />
          <UploadZone
            accept={DOCUMENT_TYPES.join(",")}
            multiple
            text={t("step4.clickOrDrag")}
            onFiles={(f) => addFiles(f, DOCUMENT_TYPES, DOC_MAX_BYTES, setDocPreviews, "documents")}
          />
          <PreviewGrid
            previews={docPreviews}
            onRemove={(i) => removeFile(i, docPreviews, setDocPreviews, "documents")}
          />
        </div>

      </div>

      {step4Error && (
        <p className="text-sm text-error">{step4Error}</p>
      )}

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
