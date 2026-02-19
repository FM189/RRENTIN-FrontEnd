"use client";

interface CounterFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function CounterField({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
}: CounterFieldProps) {
  const numValue = Number(value) || 0;

  const handleDecrement = () => {
    const newValue = numValue - step;
    if (newValue >= min) {
      onChange(Math.round(newValue * 10) / 10);
    }
  };

  const handleIncrement = () => {
    const newValue = numValue + step;
    if (newValue <= max) {
      onChange(Math.round(newValue * 10) / 10);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-between border border-[rgba(65,65,65,0.16)] rounded-lg px-5 h-14 shadow-[0px_0px_10px_rgba(0,0,0,0.07)]">
      <span className="text-sm font-medium text-heading">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={numValue <= min}
          className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary transition-colors hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="14" height="2" viewBox="0 0 14 2" fill="none">
            <path d="M1 1H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-base font-semibold text-heading w-8 text-center">
          {Number(value) % 1 === 0 ? Number(value) : Number(value).toFixed(1)}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={numValue >= max}
          className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary transition-colors hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
