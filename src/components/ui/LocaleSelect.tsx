"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { setUserLocale } from "@/services/locale";
import { Locale } from "@/i18n/config";

interface LocaleOption {
  code: Locale;
  name: string;
  flag: string;
}

const locales: LocaleOption[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
];

interface LocaleSelectProps {
  className?: string;
}

export default function LocaleSelect({ className = "" }: LocaleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();

  const selectedLocale = locales.find((l) => l.code === currentLocale) || locales[0];

  const handleSelect = (locale: LocaleOption) => {
    setIsOpen(false);
    startTransition(() => {
      setUserLocale(locale.code);
    });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#333333] hover:text-[#0245A5] transition-colors disabled:opacity-50"
      >
        <span>{selectedLocale.flag}</span>
        <span className="hidden sm:inline">{selectedLocale.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-30">
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleSelect(locale)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selectedLocale.code === locale.code
                    ? "text-[#0245A5] font-medium"
                    : "text-[#333333]"
                }`}
              >
                <span>{locale.flag}</span>
                <span>{locale.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
