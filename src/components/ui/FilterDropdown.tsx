"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export interface FilterDropdownOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  value: string;
  placeholder: string;
  options: FilterDropdownOption[];
  onChange: (value: string) => void;
  /** Extra classes applied to the trigger button (e.g. height, border-radius). */
  buttonClassName?: string;
  /** Inline style applied to the trigger button (e.g. border, box-shadow). */
  buttonStyle?: React.CSSProperties;
}

export default function FilterDropdown({
  value,
  placeholder,
  options,
  onChange,
  buttonClassName = "h-11 rounded-lg",
  buttonStyle = {
    border: "1px solid #F2F2F2",
    boxShadow: "0px 0px 12px rgba(125, 182, 255, 0.1)",
  },
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div className="relative min-w-[140px] flex-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between bg-white pl-5 pr-4 text-sm leading-4 tracking-[0.05em] transition-colors ${buttonClassName}`}
        style={buttonStyle}
      >
        <span className={value ? "text-text" : "text-[#969696]"}>
          {value ? selectedLabel : placeholder}
        </span>
        <Image
          src="/images/icons/dashboard/property/chevron-down.png"
          alt=""
          width={8}
          height={5}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-20 mt-1 w-full overflow-y-auto rounded-lg bg-white py-1"
          style={{ maxHeight: "220px", boxShadow: "0px 4px 16px rgba(53, 130, 231, 0.15)" }}
        >
          {/* "All / clear" option */}
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#F0F7FF] ${
              !value ? "font-semibold text-primary" : "font-normal text-[#969696]"
            }`}
          >
            {placeholder}
            {!value && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>

          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#F0F7FF] ${
                value === option.value ? "font-semibold text-primary" : "font-normal text-text"
              }`}
            >
              {option.label}
              {value === option.value && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
