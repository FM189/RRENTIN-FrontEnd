"use client";

import { useTranslations } from "next-intl";

const MOCK_DATA = {
  experienceText:
    "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
  serviceCharges: [{ label: "Propert Showing", amount: "$200" }],
};

export default function AgentExperienceCard() {
  const t = useTranslations("Dashboard.agents.detailPage");

  return (
    <div
      className="rounded-[14px] bg-white p-[24px]"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      <div className="flex flex-col gap-[18px]">
        {/* Section title */}
        <h3 className="text-[22px] font-medium leading-[26px] text-[#1F242F]">
          {t("experienceTitle")}
        </h3>

        {/* Content blocks */}
        <div className="flex flex-col gap-[10px]">
          {/* Experience block */}
          <div className="flex flex-col gap-[4px]">
            <span className="text-[20px] font-semibold leading-[29px] text-[#1F242F]">
              {t("experienceLabel")}
            </span>
            <p className="text-[20px] font-medium leading-[29px] text-[#32343C]">
              {MOCK_DATA.experienceText}
            </p>
          </div>

          {/* Service Charges block */}
          <div className="flex flex-col gap-[4px]">
            <span className="text-[20px] font-semibold leading-[29px] text-[#1F242F]">
              {t("serviceChargesLabel")}
            </span>
            {MOCK_DATA.serviceCharges.map((item, idx) => (
              <div key={idx} className="flex items-center gap-[8px]">
                <span className="text-[20px] font-medium leading-[29px] text-[#32343C]">
                  •&nbsp;{item.label}:
                </span>
                <span className="text-[20px] font-semibold leading-[29px] text-[#32343C]">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
