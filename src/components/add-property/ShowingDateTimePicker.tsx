"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ShowingDateTimePickerProps {
  selectedDates: string[];
  timeFrom: string;
  timeTo: string;
  onDatesChange: (dates: string[]) => void;
  onTimeFromChange: (time: string) => void;
  onTimeToChange: (time: string) => void;
}

const TIME_OPTIONS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ShowingDateTimePicker({
  selectedDates,
  timeFrom,
  timeTo,
  onDatesChange,
  onTimeFromChange,
  onTimeToChange,
}: ShowingDateTimePickerProps) {
  const t = useTranslations("Dashboard.properties.addPropertyPage");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long", year: "numeric" }
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = new Date(currentYear, currentMonth, day);
    if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;

    if (selectedDates.includes(dateStr)) {
      onDatesChange(selectedDates.filter((d) => d !== dateStr));
    } else {
      onDatesChange([...selectedDates, dateStr]);
    }
  };

  const isDateSelected = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return selectedDates.includes(dateStr);
  };

  const isDatePast = (day: number) => {
    const dateObj = new Date(currentYear, currentMonth, day);
    return dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <h3 className="text-base font-medium text-heading text-center">
        {t("showDateTime")}
      </h3>

      <div className="border border-[rgba(65,65,65,0.16)] rounded-lg p-5">
        {/* Calendar */}
        <p className="text-sm font-medium text-heading text-center mb-3">
          {t("selectPreferredDay")}
        </p>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="text-sm font-medium text-heading">{monthName}</span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 4L10 8L6 12"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-text-muted py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div key={index} className="flex items-center justify-center">
              {day ? (
                <button
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={isDatePast(day)}
                  className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                    isDateSelected(day)
                      ? "bg-primary text-white"
                      : isDatePast(day)
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-text hover:bg-primary-light"
                  }`}
                >
                  {day}
                </button>
              ) : (
                <div className="w-9 h-9" />
              )}
            </div>
          ))}
        </div>

        {/* Time range */}
        <div className="mt-5 border-t border-[rgba(65,65,65,0.16)] pt-4">
          <p className="text-sm font-medium text-heading text-center mb-3">
            {t("selectTimeRange")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm text-text-muted font-normal">
                {t("timeFrom")}
              </label>
              <select
                value={timeFrom}
                onChange={(e) => onTimeFromChange(e.target.value)}
                className="w-full h-10.75 px-4 border border-[rgba(65,65,65,0.16)] rounded-lg text-sm font-medium text-text bg-white appearance-none cursor-pointer shadow-[0px_0px_10px_rgba(0,0,0,0.07)] focus:outline-none focus:border-primary"
              >
                <option value="">{t("selectPlaceholder")}</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm text-text-muted font-normal">
                {t("timeTo")}
              </label>
              <select
                value={timeTo}
                onChange={(e) => onTimeToChange(e.target.value)}
                className="w-full h-10.75 px-4 border border-[rgba(65,65,65,0.16)] rounded-lg text-sm font-medium text-text bg-white appearance-none cursor-pointer shadow-[0px_0px_10px_rgba(0,0,0,0.07)] focus:outline-none focus:border-primary"
              >
                <option value="">{t("selectPlaceholder")}</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
