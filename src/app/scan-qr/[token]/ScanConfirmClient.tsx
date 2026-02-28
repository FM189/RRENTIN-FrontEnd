"use client";

import { useState } from "react";
import { scanQRCode } from "@/actions/visit-requests";
import type { QRScanDetails } from "@/actions/visit-requests";

interface Props {
  token:   string;
  details: QRScanDetails;
}

export default function ScanConfirmClient({ token, details }: Props) {
  const [state,   setState]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg,  setErrMsg]  = useState("");

  const handleConfirm = async () => {
    setState("loading");
    try {
      await scanQRCode(token);
      setState("success");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  // ── Success ──────────────────────────────────────────────────────────────────
  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-[#32343C]">Visit Confirmed!</p>
          <p className="text-sm text-[#969696]">
            The visit for <span className="font-semibold text-[#32343C]">{details.tenantName}</span> has been marked as complete.
          </p>
        </div>
        <div className="w-full rounded-[8px] border border-[rgba(65,65,65,0.1)] bg-[#F0FDF4] px-5 py-4 text-left">
          <p className="text-sm font-semibold text-green-700">{details.propertyTitle}</p>
          <p className="mt-0.5 text-xs text-green-600">{details.preferredDate} · {details.preferredTime}</p>
        </div>
        <p className="text-xs text-[#969696]">You may close this page.</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <svg className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-[#32343C]">Confirmation Failed</p>
          <p className="text-sm text-[#969696]">{errMsg}</p>
        </div>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="rounded-[4px] border border-[rgba(65,65,65,0.2)] px-8 py-2.5 text-sm font-semibold text-[#32343C] hover:bg-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Idle / Loading ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* Visit info */}
      <div className="flex flex-col gap-3 rounded-[8px] border border-[rgba(65,65,65,0.1)] bg-white p-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#969696]">Property</p>
          <p className="text-base font-semibold text-[#32343C]">{details.propertyTitle}</p>
          {details.propertyAddress && (
            <p className="text-xs text-[#969696]">{details.propertyAddress}</p>
          )}
        </div>

        <div className="h-px bg-[rgba(65,65,65,0.08)]" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#969696]">Tenant</p>
            <p className="text-sm font-medium text-[#32343C]">{details.tenantName}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#969696]">Date</p>
            <p className="text-sm font-medium text-[#32343C]">{details.preferredDate}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#969696]">Time Slot</p>
            <p className="text-sm font-medium text-[#32343C]">{details.preferredTime}</p>
          </div>
        </div>
      </div>

      {/* Warning note */}
      <div className="rounded-[6px] border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs font-medium leading-relaxed text-amber-800">
          Only confirm after you have shown the <span className="font-bold">complete property</span> to the tenant. This action cannot be undone.
        </p>
      </div>

      {/* Confirm button */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={state === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#0245A5] py-4 text-base font-bold text-white hover:bg-[#01357A] disabled:opacity-60"
      >
        {state === "loading" ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Confirming...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Confirm Visit Complete
          </>
        )}
      </button>
    </div>
  );
}
