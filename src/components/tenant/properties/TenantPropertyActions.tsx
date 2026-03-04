"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { VisitConfirmationModal, VisitRequestModal, VisitPaymentModal } from "@/components/ui";
import type { VisitRequestFormData } from "@/components/ui";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { TenantPropertyDetail } from "@/actions/tenant-properties";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/types/notifications";

interface TenantPropertyActionsProps {
  visitDetail: TenantPropertyDetail | null;
}

export default function TenantPropertyActions({ visitDetail }: TenantPropertyActionsProps) {
  const t        = useTranslations("Dashboard.tenantProperties.detailPage");
  const { user } = useCurrentUser();

  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [requestOpen,  setRequestOpen]  = useState(false);
  const [paymentOpen,  setPaymentOpen]  = useState(false);
  const [formData,     setFormData]     = useState<VisitRequestFormData | null>(null);

  const handleVisitConfirm = () => {
    setConfirmOpen(false);
    setRequestOpen(true);
  };

  const handleRequestNext = (data: VisitRequestFormData) => {
    setRequestOpen(false);
    setFormData(data);
    setPaymentOpen(true);
  };

  const handlePaymentBack = () => {
    setPaymentOpen(false);
    setRequestOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentOpen(false);
    setFormData(null);
  };

  const handlePaymentConfirmed = async () => {
    const ownerId = visitDetail?.ownerId;
    if (!ownerId) return;

    await createNotification({
      userId: ownerId,
      type: NotificationType.SHOWING_SCHEDULED,
      title: "Visit Request Received",
      message: `A tenant has requested a visit for ${visitDetail!.title}.`,
      href: "/dashboard/owner/proposals",
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex h-10 cursor-pointer items-center rounded-[6px] bg-[#5390E0] px-5"
          >
            <span className="text-[14px] font-semibold leading-[16px] tracking-[0.18px] text-white">
              {t("rentNow")}
            </span>
          </button>
          <button
            type="button"
            className="flex h-10 cursor-pointer items-center rounded-[6px] bg-[#0245A5] px-5"
          >
            <span className="text-[14px] font-semibold leading-[16px] tracking-[0.18px] text-white">
              {t("contactOwner")}
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => visitDetail && setConfirmOpen(true)}
          disabled={!visitDetail}
          className="flex h-10 items-center rounded-[6px] bg-[#0245A5] px-5 disabled:opacity-50"
        >
          <span className="text-[14px] font-semibold leading-[16px] tracking-[0.18px] text-white">
            {t("viewRequest")}
          </span>
        </button>
      </div>

      {/* Step 1: Confirm visit fee */}
      {visitDetail && (
        <VisitConfirmationModal
          isOpen={confirmOpen}
          visitFee={visitDetail.visitRequestPrice}
          propertyId={visitDetail.id}
          tenantId={user?.id ?? ""}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleVisitConfirm}
        />
      )}

      {/* Step 2: Visit request form */}
      {visitDetail && (
        <VisitRequestModal
          isOpen={requestOpen}
          detail={visitDetail}
          onClose={() => setRequestOpen(false)}
          onNext={handleRequestNext}
        />
      )}

      {/* Step 3: Payment */}
      {visitDetail && formData && (
        <VisitPaymentModal
          isOpen={paymentOpen}
          detail={visitDetail}
          requestData={formData}
          tenantId={user?.id ?? ""}
          onClose={() => setPaymentOpen(false)}
          onBack={handlePaymentBack}
          onSuccess={handlePaymentSuccess}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      )}
    </>
  );
}
