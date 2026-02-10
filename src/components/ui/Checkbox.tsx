"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || `checkbox-${generatedId}`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className="flex items-start gap-2 cursor-pointer group"
        >
          <div className="relative shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className="peer sr-only"
              {...props}
            />
            <div className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-primary rounded transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
              <svg
                className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <svg
              className="absolute inset-0 w-5 h-5 lg:w-6 lg:h-6 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          {label && (
            <span className="text-xs lg:text-base leading-tight lg:leading-4.75 tracking-[0.02em] text-text-light">
              {label}
            </span>
          )}
        </label>
        {error && (
          <span className="text-sm text-error font-normal ml-8">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
