"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SignatureCanvas from "@/components/common/SignatureCanvas";
import { signAgreementAsOwner, previewAgreementForOwner } from "@/actions/rent-agreement";
import type { RentBookingDetail } from "@/actions/rent-booking";

interface Props {
  detail:   RentBookingDetail;
  onSigned: () => void;
  onClose:  () => void;
}

export default function OwnerAgreementModal({ detail, onSigned, onClose }: Props) {
  const t = useTranslations("Dashboard.ownerAgreement");

  const [step,           setStep]           = useState<1 | 2>(1);
  const [pdfOpened,      setPdfOpened]      = useState(false);
  const [ownerAddress,   setOwnerAddress]   = useState(detail.agreement?.ownerAddress ?? "");
  const [internetCharge, setInternetCharge] = useState(detail.agreement?.internetCharge ?? 0);
  const [parkingFee,     setParkingFee]     = useState(detail.agreement?.parkingFee ?? 0);
  const [includedItems,  setIncludedItems]  = useState(detail.agreement?.includedItems ?? "");
  const [previewUrl,     setPreviewUrl]     = useState<string | null>(null);
  const [previewing,     setPreviewing]     = useState(false);
  const [signatureData,  setSignatureData]  = useState<string | null>(null);
  const [confirmed,      setConfirmed]      = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const canPreview = ownerAddress.trim().length > 0;
  const canSubmit  = signatureData && confirmed;

  const handlePreview = async () => {
    if (!canPreview) return;
    setPreviewing(true);
    setError(null);
    try {
      const res = await previewAgreementForOwner({
        bookingId:      detail.id,
        ownerAddress:   ownerAddress.trim(),
        internetCharge: internetCharge || 0,
        parkingFee:     parkingFee || 0,
        includedItems:  includedItems.trim(),
      });
      if (!res.success) {
        setError(res.error ?? t("errorGeneric"));
        return;
      }
      setPreviewUrl(res.pdfUrl!);
      setStep(2);
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await signAgreementAsOwner({
        bookingId:      detail.id,
        ownerAddress:   ownerAddress.trim(),
        internetCharge: internetCharge || 0,
        parkingFee:     parkingFee || 0,
        includedItems:  includedItems.trim(),
        signatureData:  signatureData!,
      });
      if (!res.success) {
        setError(res.error ?? t("errorGeneric"));
        return;
      }
      onSigned();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-[600px] flex-col overflow-hidden rounded-[12px] bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(102,102,102,0.12)] px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-[#32343C]">{t("title")}</p>
              <span className="rounded-full bg-[#F0F4FF] px-2.5 py-0.5 text-xs font-medium text-[#0245A5]">
                {t(step === 1 ? "stepLabel1" : "stepLabel2")}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#969696]">{t(step === 1 ? "subtitleFill" : "subtitleSign")}</p>
          </div>
          <button onClick={onClose} className="text-[#969696] hover:text-[#32343C] text-xl font-light">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* ── Step 1: Fill Details ── */}
          {step === 1 && (
            <>
              {/* Agreement summary */}
              <div className="rounded-[8px] bg-[#F7FAFE] border border-[rgba(2,69,165,0.12)] p-4 flex flex-col gap-1.5">
                <p className="text-xs font-bold text-[#0245A5]">{t("agreementSummary")}</p>
                <p className="text-xs text-[#545454]">{detail.propertyTitle} · {detail.propertyAddress}</p>
                <p className="text-xs text-[#545454]">{t("tenant")}: <span className="font-semibold">{detail.tenantInfo.fullName}</span></p>
                <p className="text-xs text-[#545454]">{t("period")}: {detail.moveInDate} → {detail.moveOutDate}</p>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-[#32343C]">{t("sectionFillFields")}</p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#32343C]">
                    {t("ownerAddress")} <span className="text-[#EE1D52]">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                    placeholder={t("ownerAddressPlaceholder")}
                    className="h-11 w-full rounded-[6px] border border-[rgba(102,102,102,0.35)] px-3 text-sm text-[#32343C] placeholder:text-[rgba(102,102,102,0.5)] focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#32343C]">{t("internetCharge")}</label>
                    <input
                      type="number"
                      min={0}
                      value={internetCharge || ""}
                      onChange={(e) => setInternetCharge(Number(e.target.value))}
                      placeholder="0"
                      className="h-11 w-full rounded-[6px] border border-[rgba(102,102,102,0.35)] px-3 text-sm text-[#32343C] focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#32343C]">{t("parkingFee")}</label>
                    <input
                      type="number"
                      min={0}
                      value={parkingFee || ""}
                      onChange={(e) => setParkingFee(Number(e.target.value))}
                      placeholder="0"
                      className="h-11 w-full rounded-[6px] border border-[rgba(102,102,102,0.35)] px-3 text-sm text-[#32343C] focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#32343C]">{t("includedItems")}</label>
                  <div className="rounded-[6px] bg-amber-50 border border-amber-100 px-3 py-2">
                    <p className="text-xs font-semibold text-amber-700">{t("clause31Title")}</p>
                    <p className="mt-0.5 text-xs text-amber-600">{t("clause31Text")}</p>
                  </div>
                  <textarea
                    value={includedItems}
                    onChange={(e) => setIncludedItems(e.target.value)}
                    rows={3}
                    placeholder={t("includedItemsPlaceholder")}
                    className="w-full resize-none rounded-[6px] border border-[rgba(102,102,102,0.35)] px-3 py-2.5 text-sm text-[#32343C] placeholder:text-[rgba(102,102,102,0.5)] focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Review & Sign ── */}
          {step === 2 && previewUrl && (
            <>
              {/* PDF document card */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-[#32343C]">{t("previewSection")}</p>
                <p className="text-xs text-[#969696]">{t("previewNote")}</p>
                <a
                  href={previewUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPdfOpened(true)}
                  className="flex items-center justify-between rounded-[8px] border border-[rgba(2,69,165,0.2)] bg-[#F7FAFE] p-4 hover:bg-[#EEF4FF] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[#0245A5]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#32343C]">Rental Agreement.pdf</p>
                      <p className="text-xs text-[#969696]">{t("openPdfNote")}</p>
                    </div>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#0245A5]"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
                {pdfOpened && (
                  <p className="flex items-center gap-1.5 text-xs text-green-600">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {t("pdfOpenedConfirm")}
                  </p>
                )}
              </div>

              {/* Signature */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-[#32343C]">
                  {t("signatureLabel")} <span className="text-[#EE1D52]">*</span>
                </p>
                <p className="text-xs text-[#969696]">{t("signatureNote")}</p>
                <SignatureCanvas
                  onChange={setSignatureData}
                  height={120}
                  placeholder={t("signaturePlaceholder")}
                  clearLabel={t("signatureClear")}
                />
              </div>

              {/* Confirm checkbox */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                />
                <span className="text-sm text-[#32343C]">{t("confirmCheckbox")}</span>
              </label>
            </>
          )}

          {error && <p className="text-sm text-[#EE1D52]">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[rgba(102,102,102,0.12)] px-6 py-4">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={previewing}
                className="rounded-[8px] border border-[rgba(102,102,102,0.25)] px-5 py-2.5 text-sm font-semibold text-[#545454] hover:bg-[#F5F5F5] disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handlePreview}
                disabled={!canPreview || previewing}
                className="flex items-center gap-2 rounded-[8px] bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {previewing && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {previewing ? t("generating") : t("previewButton")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={submitting}
                className="rounded-[8px] border border-[rgba(102,102,102,0.25)] px-5 py-2.5 text-sm font-semibold text-[#545454] hover:bg-[#F5F5F5] disabled:opacity-50"
              >
                {t("backToFields")}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="flex items-center gap-2 rounded-[8px] bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {submitting ? t("signing") : t("signAndAccept")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
