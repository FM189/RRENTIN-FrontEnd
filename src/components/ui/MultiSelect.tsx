"use client";

import { useState, useRef, useEffect } from "react";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  allowCustom?: boolean;
  customItems?: string[];
  onAddCustom?: (item: string) => void;
  onRemoveCustom?: (item: string) => void;
  customPlaceholder?: string;
}

export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
  error,
  className = "",
  allowCustom = false,
  customItems = [],
  onAddCustom,
  onRemoveCustom,
  customPlaceholder = "Type and press Enter...",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = value || [];
  const safeCustomItems = customItems || [];

  const toggleOption = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      onChange([...selected, optionValue]);
    }
  };

  const CUSTOM_LIMIT = 10;
  const customLimitReached = safeCustomItems.length >= CUSTOM_LIMIT;

  const handleAddCustom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = customInput.trim();
      if (trimmed && !safeCustomItems.includes(trimmed) && onAddCustom && !customLimitReached) {
        onAddCustom(trimmed);
      }
      setCustomInput("");
    }
  };

  // Build display: count predefined selected + custom items
  const predefinedLabels = selected
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);
  const totalCount = predefinedLabels.length + safeCustomItems.length;

  return (
    <div className="flex flex-col gap-1 w-full" ref={containerRef}>
      {label && (
        <label className="text-sm lg:text-base text-text-muted font-normal leading-4.75">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full h-10.75 px-5 pr-10
            border rounded-lg
            text-sm text-left
            bg-white
            cursor-pointer
            transition-colors duration-200
            shadow-[0px_0px_10px_rgba(0,0,0,0.07)]
            hover:border-border-hover
            focus:border-primary focus:outline-none
            ${error ? "border-error" : "border-[rgba(65,65,65,0.16)]"}
            ${className}
          `}
        >
          {totalCount > 0 ? (
            <span className="text-text font-medium truncate block">
              {totalCount <= 2
                ? [...predefinedLabels, ...safeCustomItems].join(", ")
                : `${totalCount} selected`}
            </span>
          ) : (
            <span className="text-[rgba(65,65,65,0.6)]">{placeholder}</span>
          )}
        </button>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            width="14"
            height="8"
            viewBox="0 0 14 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
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

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-[rgba(65,65,65,0.16)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Predefined options */}
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                />
                <span className="text-sm text-heading">{option.label}</span>
              </label>
            ))}

            {/* Custom items as checked options */}
            {safeCustomItems.map((item) => (
              <label
                key={`custom-${item}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked
                  onChange={() => onRemoveCustom?.(item)}
                  className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                />
                <span className="text-sm text-heading">{item}</span>
              </label>
            ))}

            {/* Custom input inside dropdown */}
            {allowCustom && (
              <div className="px-4 py-2.5 border-t border-[rgba(65,65,65,0.1)]">
                {customLimitReached ? (
                  <p className="text-xs text-[rgba(65,65,65,0.5)]">
                    Maximum {CUSTOM_LIMIT} custom items reached.
                  </p>
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={handleAddCustom}
                    placeholder={customPlaceholder}
                    className="w-full h-8 px-3 border border-[rgba(65,65,65,0.16)] rounded text-sm text-text placeholder:text-[rgba(65,65,65,0.4)] bg-white focus:outline-none focus:border-primary"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
