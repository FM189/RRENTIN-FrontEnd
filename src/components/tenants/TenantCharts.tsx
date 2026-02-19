"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTranslations } from "next-intl";

/* ─────────── Mock data ─────────── */

const RENT_DATA = [
  { month: "Jan", paidRent: 1200, dueRent: 600, overdueRent: 100 },
  { month: "Feb", paidRent: 1400, dueRent: 1200, overdueRent: 100 },
  { month: "Mar", paidRent: 2200, dueRent: 1400, overdueRent: 700 },
  { month: "Apr", paidRent: 1100, dueRent: 200, overdueRent: 100 },
  { month: "May", paidRent: 1300, dueRent: 900, overdueRent: 300 },
  { month: "Jun", paidRent: 1900, dueRent: 1100, overdueRent: 200 },
];

const CONTRACT_DATA = [
  { month: "Jan", renewed: 9, pending: 6, expired: 2 },
  { month: "Feb", renewed: 12, pending: 11, expired: 3 },
  { month: "Mar", renewed: 17, pending: 13, expired: 6 },
  { month: "Apr", renewed: 7, pending: 2, expired: 1 },
  { month: "May", renewed: 10, pending: 8, expired: 4 },
  { month: "Jun", renewed: 15, pending: 9, expired: 3 },
];

const FEEDBACK_DATA = [
  { nameKey: "excellent", value: 40, color: "#1B2A4A" },
  { nameKey: "good", value: 30, color: "#3582E7" },
  { nameKey: "average", value: 20, color: "#5B8ED6" },
  { nameKey: "poor", value: 10, color: "#BAD4F5" },
];

/* ─────────── Shared helpers ─────────── */

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-[rgba(53,130,231,0.1)] bg-white px-5 pt-5 pb-4">
      <h3 className="mb-3 text-[14px] font-bold leading-[17px] text-[#1F242F]">{title}</h3>
      {children}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="h-[8px] w-[8px] shrink-0 rounded-full"
        style={{
          background: "white",
          outline: `2px solid ${color}`,
          outlineOffset: "-1px",
          boxShadow: `inset 0 0 0 2px white, 0 0 0 2px ${color}`,
        }}
      />
      <span className="text-[11px] leading-[14px] text-[#969696]">{label}</span>
    </div>
  );
}

const tooltipStyle = {
  fontSize: "11px",
  borderRadius: "6px",
  border: "1px solid #E8F0FD",
  padding: "4px 8px",
};

const axisTickStyle = { fontSize: 10, fill: "#969696" };

/* ─────────── Charts ─────────── */

export function RentPaymentTrendChart() {
  const t = useTranslations("Dashboard.tenants.profilePage");

  return (
    <ChartCard title={t("rentPaymentTrend")}>
      <ResponsiveContainer width="100%" height={185}>
        <LineChart data={RENT_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(53,130,231,0.12)"
            vertical={false}
          />
          <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            ticks={[0, 600, 1200, 1800, 2400]}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="paidRent"
            stroke="#3582E7"
            strokeWidth={1.5}
            dot={{ r: 4, fill: "white", stroke: "#3582E7", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="dueRent"
            stroke="#FDAC3B"
            strokeWidth={1.5}
            dot={{ r: 4, fill: "white", stroke: "#FDAC3B", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="overdueRent"
            stroke="#E35454"
            strokeWidth={1.5}
            dot={{ r: 4, fill: "white", stroke: "#E35454", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <LegendDot color="#3582E7" label={t("paidRent")} />
        <LegendDot color="#FDAC3B" label={t("dueRent")} />
        <LegendDot color="#E35454" label={t("overdueRent")} />
      </div>
    </ChartCard>
  );
}

export function ContractRenewalTrendChart() {
  const t = useTranslations("Dashboard.tenants.profilePage");

  return (
    <ChartCard title={t("contractRenewalTrend")}>
      <ResponsiveContainer width="100%" height={185}>
        <LineChart data={CONTRACT_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(53,130,231,0.12)"
            vertical={false}
          />
          <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            ticks={[0, 5, 10, 15, 20]}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="renewed"
            stroke="#3582E7"
            strokeWidth={1.5}
            dot={{ r: 4, fill: "white", stroke: "#3582E7", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#FDAC3B"
            strokeWidth={1.5}
            dot={{ r: 4, fill: "white", stroke: "#FDAC3B", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expired"
            stroke="#E35454"
            strokeWidth={1.5}
            dot={{ r: 4, fill: "white", stroke: "#E35454", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <LegendDot color="#3582E7" label={t("renewed")} />
        <LegendDot color="#FDAC3B" label={t("pending")} />
        <LegendDot color="#E35454" label={t("expired")} />
      </div>
    </ChartCard>
  );
}

export function TenantFeedbackChart() {
  const t = useTranslations("Dashboard.tenants.profilePage");

  const feedbackLabels = {
    excellent: t("excellent"),
    good: t("good"),
    average: t("average"),
    poor: t("poor"),
  } as const;

  return (
    <ChartCard title={t("tenantFeedback")}>
      <div className="flex justify-center">
        <PieChart width={180} height={180}>
          <Pie
            data={FEEDBACK_DATA}
            cx={90}
            cy={90}
            innerRadius={52}
            outerRadius={82}
            paddingAngle={4}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {FEEDBACK_DATA.map((entry, index) => (
              <Cell key={index} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={tooltipStyle}
          />
        </PieChart>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2">
        {FEEDBACK_DATA.map((entry) => (
          <div key={entry.nameKey} className="flex items-center gap-1.5">
            <div
              className="h-[10px] w-[10px] shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] leading-[14px] text-[#969696]">
              {feedbackLabels[entry.nameKey as keyof typeof feedbackLabels]} ({entry.value}%)
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
