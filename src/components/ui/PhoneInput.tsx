"use client";

import { forwardRef, useState, useRef, useEffect, useMemo } from "react";
import {
  getCountries,
  getCountryCallingCode,
  CountryCode,
  isValidPhoneNumber,
} from "libphonenumber-js";

export { isValidPhoneNumber };

interface PhoneInputProps {
  label?: string;
  error?: string;
  name?: string;
  value?: string;
  defaultCountry?: CountryCode;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange?: (fullNumber: string, countryCode: CountryCode) => void;
}

function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function getCountryName(code: string, locale = "en"): string {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    return displayNames.of(code) || code;
  } catch {
    return code;
  }
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      error,
      name,
      value = "",
      defaultCountry = "TH",
      placeholder = "",
      onChange,
      onPhoneChange,
    },
    ref
  ) => {
    const [selectedCountry, setSelectedCountry] =
      useState<CountryCode>(defaultCountry);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const sortedCountries = useMemo(() => {
      const allCountries = getCountries();
      return allCountries
        .map((code) => ({
          code,
          name: getCountryName(code),
          dialCode: `+${getCountryCallingCode(code)}`,
          flag: countryCodeToFlag(code),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const filteredCountries = useMemo(() => {
      if (!search) return sortedCountries;
      const q = search.toLowerCase();
      return sortedCountries.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.dialCode.includes(q) ||
          c.code.toLowerCase().includes(q)
      );
    }, [search, sortedCountries]);

    const dialCode = `+${getCountryCallingCode(selectedCountry)}`;

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setSearch("");
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen]);

    const handleCountrySelect = (code: CountryCode) => {
      setSelectedCountry(code);
      setIsOpen(false);
      setSearch("");
      if (onPhoneChange) {
        const newDialCode = `+${getCountryCallingCode(code)}`;
        onPhoneChange(`${newDialCode}${value}`, code);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      if (onPhoneChange) {
        onPhoneChange(`${dialCode}${e.target.value}`, selectedCountry);
      }
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm lg:text-base text-[var(--color-text-muted)] font-normal leading-[19px]">
            {label}
          </label>
        )}
        <div className="relative" ref={dropdownRef}>
          {/* Country selector button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 lg:gap-4 z-10 cursor-pointer"
          >
            <div className="flex items-center gap-1 lg:gap-2">
              <span className="text-xl lg:text-2xl leading-none">
                {countryCodeToFlag(selectedCountry)}
              </span>
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-base lg:text-lg text-[#111111] font-normal">
              {dialCode}
            </span>
          </button>

          <input
            ref={ref}
            type="tel"
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={handleInputChange}
            className={`
              w-full h-12 lg:h-14 pl-28 lg:pl-36 pr-4 lg:pr-6
              border border-[var(--color-border)] rounded-[var(--radius-lg)]
              text-sm lg:text-base text-[var(--color-text)]
              placeholder:text-[var(--color-placeholder)]
              bg-white
              transition-colors duration-200
              hover:border-[var(--color-border-hover)]
              focus:border-[var(--color-primary)] focus:outline-none
              ${error ? "border-[var(--color-error)]" : ""}
            `}
          />

          {/* Country dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 max-h-64 bg-white border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-2 border-b border-[var(--color-border)]">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full h-9 px-3 border border-[var(--color-border)] rounded-lg text-sm focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
              <div className="overflow-y-auto max-h-52">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() =>
                      handleCountrySelect(country.code as CountryCode)
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                      selectedCountry === country.code ? "bg-blue-50" : ""
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm text-[var(--color-text)] flex-1 truncate">
                      {country.name}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {country.dialCode}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {error && (
          <span className="text-sm text-[var(--color-error)] font-normal">
            {error}
          </span>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
