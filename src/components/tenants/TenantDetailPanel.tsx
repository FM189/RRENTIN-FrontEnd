"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const MOCK_DETAILS = {
  propertyName: "Luxury Apartment - 5th Avenue, NY",
  propertyId: "1",
  monthlyRent: "$1,500",
  leaseDuration: "12 Months",
  securityDeposit: "$3,000",
  contractStatus: "Signed",
  renewalOption: "Yes",
  lastPaymentDate: "5th Jan 2024",
  nextDueDate: "5th Feb 2024",
  totalAmountPaid: "$9,000",
  pendingAmount: "$0",
  contractStart: "01 Jan 2024",
  contractExpiry: "5th Feb 2024",
  leaseStatus: "Active",
  noticePeriod: "30 Days",
  agentName: "Michael Smith",
  agency: "XYZ",
  contact: "+1 234 567 890",
  agentEmail: "michael@xyz.com",
};

const innerCard = "rounded-[8px] border border-[rgba(53,130,231,0.1)] bg-white px-5 py-5";

function TwoColRow({
  left,
  right,
}: {
  left: { label: string; value: React.ReactNode };
  right?: { label: string; value: React.ReactNode };
}) {
  return (
    <div
      className={`grid gap-y-1 border-b border-[#F0F0F0] py-[10px] ${
        right ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
      }`}
    >
      <div className="flex items-center justify-between sm:pr-8">
        <span className="text-[13px] leading-[16px] text-[#969696]">{left.label}</span>
        <span className="text-[13px] leading-[16px] font-medium text-[#1F242F]">{left.value}</span>
      </div>
      {right && (
        <div className="flex items-center justify-between sm:pl-8">
          <span className="text-[13px] leading-[16px] text-[#969696]">{right.label}</span>
          <span className="text-[13px] leading-[16px] font-medium text-[#1F242F]">{right.value}</span>
        </div>
      )}
    </div>
  );
}

export default function TenantDetailPanel() {
  const t = useTranslations("Dashboard.tenants.profilePage");
  const d = MOCK_DETAILS;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Rental Agreement Details ── */}
      <div className={innerCard}>
        <h3 className="mb-3 text-[14px] font-bold leading-[17px] text-[#1F242F]">
          {t("rentalAgreement")}
        </h3>
        <Link
          href={`/dashboard/owner/properties/${d.propertyId}`}
          className="mb-3 block text-[13px] font-semibold text-[#0245A5] underline"
        >
          {d.propertyName}
        </Link>
        <TwoColRow
          left={{ label: t("monthlyRent"), value: d.monthlyRent }}
          right={{ label: t("leaseDuration"), value: d.leaseDuration }}
        />
        <TwoColRow
          left={{ label: t("securityDeposit"), value: d.securityDeposit }}
          right={{
            label: t("contractStatus"),
            value: <span className="font-bold">{d.contractStatus}</span>,
          }}
        />
        <TwoColRow left={{ label: t("renewalOption"), value: d.renewalOption }} />
      </div>

      {/* ── Payment History & Dues ── */}
      <div className={innerCard}>
        <h3 className="mb-3 text-[14px] font-bold leading-[17px] text-[#1F242F]">
          {t("paymentHistory")}
        </h3>
        <TwoColRow
          left={{ label: t("lastPaymentDate"), value: d.lastPaymentDate }}
          right={{ label: t("nextDueDate"), value: d.nextDueDate }}
        />
        <TwoColRow
          left={{ label: t("totalAmountPaid"), value: d.totalAmountPaid }}
          right={{ label: t("pendingAmount"), value: d.pendingAmount }}
        />
      </div>

      {/* ── Lease & Contract Overview ── */}
      <div className={innerCard}>
        <h3 className="mb-3 text-[14px] font-bold leading-[17px] text-[#1F242F]">
          {t("leaseOverview")}
        </h3>
        <TwoColRow
          left={{ label: t("contractStart"), value: d.contractStart }}
          right={{ label: t("contractExpiry"), value: d.contractExpiry }}
        />
        <TwoColRow
          left={{ label: t("contractStatus"), value: d.leaseStatus }}
          right={{ label: t("noticePeriod"), value: d.noticePeriod }}
        />
      </div>

      {/* ── Lease Actions & Control ── */}
      <div className={innerCard}>
        <h3 className="mb-3 text-[14px] font-bold leading-[17px] text-[#1F242F]">
          {t("leaseActions")}
        </h3>
        <TwoColRow
          left={{
            label: t("contractDocuments"),
            value: (
              <button type="button" className="text-[13px] font-medium text-[#0245A5]">
                {t("view")}
              </button>
            ),
          }}
          right={{
            label: t("newContract"),
            value: (
              <button type="button" className="text-[13px] font-medium text-[#0245A5]">
                {t("add")}
              </button>
            ),
          }}
        />
        <TwoColRow
          left={{
            label: t("noticeToVacate"),
            value: (
              <button type="button" className="text-[13px] font-bold underline text-[#0245A5]">
                {t("sendNotice")}
              </button>
            ),
          }}
          right={{
            label: t("agreement"),
            value: (
              <button type="button" className="text-[13px] font-medium text-[#0245A5]">
                {t("view")}
              </button>
            ),
          }}
        />
      </div>

      {/* ── Agent Information ── */}
      <div className={innerCard}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-bold leading-[17px] text-[#1F242F]">
            {t("agentInformation")}
          </h3>
          <button type="button" className="text-[13px] font-bold text-[#0245A5]">
            {t("viewDetail")}
          </button>
        </div>
        <TwoColRow
          left={{ label: t("agentName"), value: d.agentName }}
          right={{ label: t("agency"), value: d.agency }}
        />
        <TwoColRow
          left={{ label: t("contact"), value: d.contact }}
          right={{ label: t("email"), value: d.agentEmail }}
        />
      </div>

    </div>
  );
}
