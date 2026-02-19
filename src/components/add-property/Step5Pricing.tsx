"use client";

import { useTranslations } from "next-intl";
import { AddPropertyData, ContractEntry, MAX_CONTRACTS } from "@/types/property";

interface Step5Props {
  formData: AddPropertyData;
  onFormDataChange: (updates: Partial<AddPropertyData>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string;
}

export default function Step5Pricing({
  formData,
  onFormDataChange,
  onChange,
  onPrevious,
  onSubmit,
  isSubmitting,
  submitError,
}: Step5Props) {
  const t = useTranslations("Dashboard.properties.addPropertyPage");

  const contracts = formData.contracts || [];

  const updateContract = (index: number, updates: Partial<ContractEntry>) => {
    const updated = contracts.map((c, i) =>
      i === index ? { ...c, ...updates } : c
    );
    onFormDataChange({ contracts: updated });
  };

  const addContract = () => {
    if (contracts.length >= MAX_CONTRACTS) return;
    onFormDataChange({
      contracts: [...contracts, { months: 1, rentPrice: "", securityDeposit: "" }],
    });
  };

  const removeContract = (index: number) => {
    if (contracts.length <= 1) return;
    onFormDataChange({
      contracts: contracts.filter((_, i) => i !== index),
    });
  };

  return (
    <>
      <h2 className="text-base lg:text-lg font-medium capitalize text-heading">
        {t("step5.sectionTitle")}
      </h2>

      <div className="w-full flex flex-col gap-5 lg:gap-6">
        {/* Visit Request Price / Property Price */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm lg:text-base text-text-muted font-normal">
              {t("step5.visitRequestPrice")}
            </label>
            <input
              type="number"
              name="visitRequestPrice"
              value={formData.visitRequestPrice}
              onChange={onChange}
              className="w-full h-[43px] px-5 border border-[rgba(65,65,65,0.16)] rounded-lg text-sm font-medium text-text bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.07)] focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm lg:text-base text-text-muted font-normal">
              {t("step5.propertyPrice")}
            </label>
            <input
              type="number"
              name="propertyPrice"
              value={formData.propertyPrice}
              onChange={onChange}
              className="w-full h-[43px] px-5 border border-[rgba(65,65,65,0.16)] rounded-lg text-sm font-medium text-text bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.07)] focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* First contract (always visible, not removable) */}
        {contracts.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm lg:text-base text-text-muted font-normal">
                {t("step5.monthContract", { count: contracts[0].months })}
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={contracts[0].rentPrice}
                  onChange={(e) =>
                    updateContract(0, { rentPrice: e.target.value })
                  }
                  className="w-full h-[43px] px-5 border border-[rgba(65,65,65,0.16)] rounded-l-lg text-sm font-medium text-text bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.07)] focus:outline-none focus:border-primary"
                />
                <span className="h-[43px] px-4 flex items-center bg-[#F0F0F0] border border-l-0 border-[rgba(65,65,65,0.16)] rounded-r-lg text-sm font-medium text-text-muted shrink-0">
                  {t("step5.thb")}
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm lg:text-base text-text-muted font-normal">
                {t("step5.securityDeposit")}
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={contracts[0].securityDeposit}
                  onChange={(e) =>
                    updateContract(0, { securityDeposit: e.target.value })
                  }
                  className="w-full h-[43px] px-5 border border-[rgba(65,65,65,0.16)] rounded-l-lg text-sm font-medium text-text bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.07)] focus:outline-none focus:border-primary"
                />
                <span className="h-[43px] px-4 flex items-center bg-[#F0F0F0] border border-l-0 border-[rgba(65,65,65,0.16)] rounded-r-lg text-sm font-medium text-text-muted shrink-0">
                  {t("step5.thb")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Add contract button */}
        {contracts.length < MAX_CONTRACTS && (
          <div>
            <button
              type="button"
              onClick={addContract}
              className="px-5 py-2.5 text-sm font-medium rounded-full bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              {t("step5.addContract")}
            </button>
          </div>
        )}

        {/* Additional contracts */}
        {contracts.slice(1).map((contract, idx) => {
          const realIndex = idx + 1;
          return (
            <div key={realIndex} className="flex flex-col gap-4 lg:gap-0">
              {/* Row: Month + Rent Price + Security Deposit + Remove */}
              <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-5">
                {/* Remove button — mobile: inline at top right */}
                <div className="flex justify-end lg:hidden">
                  <button
                    type="button"
                    onClick={() => removeContract(realIndex)}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-hover transition-colors shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {/* Month counter */}
                <div className="lg:flex-1 min-h-[43px] flex items-center border border-[rgba(65,65,65,0.16)] rounded-full bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.07)] px-4 py-2 gap-3 w-full">
                  <span className="text-sm font-medium text-text flex-1">
                    {t("step5.month")}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContract(realIndex, {
                        months: Math.max(1, contract.months - 1),
                      })
                    }
                    className="w-7 h-7 rounded-full border-2 border-[#C4C4C4] flex items-center justify-center text-[#C4C4C4] hover:border-primary hover:text-primary transition-colors shrink-0"
                  >
                    <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                      <path d="M1 1H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <span className="text-sm font-semibold text-heading min-w-[12px] text-center">
                    {contract.months}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateContract(realIndex, { months: contract.months + 1 })
                    }
                    className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Rent Price */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm lg:text-base text-text-muted font-normal">
                    {t("step5.rentPrice")}
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={contract.rentPrice}
                      onChange={(e) =>
                        updateContract(realIndex, { rentPrice: e.target.value })
                      }
                      className="w-full h-[43px] px-5 border border-[rgba(65,65,65,0.16)] rounded-l-lg text-sm font-medium text-text bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.07)] focus:outline-none focus:border-primary"
                    />
                    <span className="h-[43px] px-3 flex items-center bg-[#F0F0F0] border border-l-0 border-[rgba(65,65,65,0.16)] rounded-r-lg text-xs font-medium text-text-muted shrink-0 whitespace-nowrap">
                      {t("step5.thbPerMonth")}
                    </span>
                  </div>
                </div>

                {/* Security Deposit */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm lg:text-base text-text-muted font-normal">
                    {t("step5.securityDeposit")}
                  </label>
                  <input
                    type="number"
                    value={contract.securityDeposit}
                    onChange={(e) =>
                      updateContract(realIndex, {
                        securityDeposit: e.target.value,
                      })
                    }
                    className="w-full h-[43px] px-5 border border-[rgba(65,65,65,0.16)] rounded-lg text-sm font-medium text-text bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.07)] focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Remove button — desktop only, inline */}
                <button
                  type="button"
                  onClick={() => removeContract(realIndex)}
                  className="hidden lg:flex w-8 h-8 rounded-full bg-primary items-center justify-center text-white hover:bg-primary-hover transition-colors shrink-0 self-end mb-1"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {submitError && (
        <p className="text-sm text-error text-center">{submitError}</p>
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
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-primary text-white text-base font-medium rounded hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "..." : t("step5.addProperty")}
        </button>
      </div>
    </>
  );
}
