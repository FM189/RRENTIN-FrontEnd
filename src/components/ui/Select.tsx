"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, options, placeholder = "Select", className = "", ...props },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm lg:text-base text-text-muted font-normal leading-4.75">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full h-12 lg:h-14 px-4 lg:px-5 pr-10 lg:pr-12
              border border-border rounded-lg
              text-sm lg:text-base text-text-muted
              bg-white
              appearance-none
              cursor-pointer
              transition-colors duration-200
              hover:border-border-hover
              focus:border-primary focus:outline-none
              ${error ? "border-error" : ""}
              ${className}
            `}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L7 7L13 1"
                stroke="#666666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-sm text-error font-normal">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
