"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      showPasswordToggle = false,
      leftIcon,
      rightElement,
      type = "text",
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm lg:text-base text-[var(--color-text-muted)] font-normal leading-[19px]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full h-12 lg:h-14 px-4 lg:px-6
              ${leftIcon ? "pl-12 lg:pl-14" : ""}
              ${showPasswordToggle || rightElement ? "pr-16 lg:pr-20" : ""}
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
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[rgba(102,102,102,0.8)] hover:text-[var(--color-text-muted)] transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {showPassword ? (
                  <path
                    d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                    fill="currentColor"
                  />
                ) : (
                  <path
                    d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                    fill="currentColor"
                  />
                )}
              </svg>
              <span className="text-lg font-normal">
                {showPassword ? "Show" : "Hide"}
              </span>
            </button>
          )}
          {rightElement && !showPasswordToggle && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightElement}
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

Input.displayName = "Input";

export default Input;
