"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  countryCode?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, countryCode = "+1", className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm lg:text-base text-[var(--color-text-muted)] font-normal leading-[19px]">
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 lg:gap-4">
            {/* US Flag */}
            <div className="flex items-center gap-1 lg:gap-2">
              <svg
                className="w-7 h-5 lg:w-9 lg:h-[26px]"
                viewBox="0 0 36 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="36" height="26" rx="2" fill="#B22334" />
                <rect y="2" width="36" height="2" fill="#EEEEEE" />
                <rect y="6" width="36" height="2" fill="#EEEEEE" />
                <rect y="10" width="36" height="2" fill="#EEEEEE" />
                <rect y="14" width="36" height="2" fill="#EEEEEE" />
                <rect y="18" width="36" height="2" fill="#EEEEEE" />
                <rect y="22" width="36" height="2" fill="#EEEEEE" />
                <rect width="18" height="14" fill="#3C3B6E" />
              </svg>
              {/* Dropdown Arrow */}
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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
              {countryCode}
            </span>
          </div>
          <input
            ref={ref}
            type="tel"
            className={`
              w-full h-12 lg:h-14 pl-24 lg:pl-32 pr-4 lg:pr-6
              border border-[var(--color-border)] rounded-[var(--radius-lg)]
              text-sm lg:text-base text-[var(--color-text)]
              placeholder:text-[var(--color-placeholder)]
              bg-white
              transition-colors duration-200
              hover:border-[var(--color-border-hover)]
              focus:border-[var(--color-primary)] focus:outline-none
              ${error ? "border-[var(--color-error)]" : ""}
              ${className}
            `}
            {...props}
          />
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
