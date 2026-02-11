"use client";

interface OnboardingFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  readOnly?: boolean;
  rightIcon?: React.ReactNode;
}

export default function OnboardingField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  error,
  readOnly = false,
  rightIcon,
}: OnboardingFieldProps) {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <label className="text-sm lg:text-base text-text-muted font-normal leading-4.75">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full h-10.75 px-5 border rounded-lg text-sm font-medium text-[#333] placeholder:text-[rgba(65,65,65,0.6)] shadow-[0px_0px_10px_rgba(0,0,0,0.07)] focus:outline-none ${
            readOnly
              ? "bg-gray-50 cursor-not-allowed text-[rgba(50,52,60,0.7)]"
              : "bg-white focus:border-[#0245A5]"
          } ${rightIcon ? "pr-10" : ""} ${
            error ? "border-error" : "border-[rgba(65,65,65,0.16)]"
          }`}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
