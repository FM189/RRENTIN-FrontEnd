"use client";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const totalSteps = steps.length;

  return (
    <div
      className="w-full grid"
      style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}
    >
      {/* Row 1: Circles with connecting lines */}
      {steps.map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isFirst = index === 0;
        const isLast = index === totalSteps - 1;

        return (
          <div key={`circle-${index}`} className="flex items-center">
            {/* Left half line */}
            <div className="flex-1 flex items-center">
              {!isFirst && (
                <div
                  className={`w-full h-[2px] ${
                    stepNumber <= currentStep ? "bg-primary" : "bg-[#C4C4C4]"
                  }`}
                />
              )}
            </div>

            {/* Circle */}
            <div
              className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 shrink-0 ${
                isCompleted
                  ? "bg-primary border-primary"
                  : isCurrent
                  ? "bg-white border-primary"
                  : "bg-white border-[#C4C4C4]"
              }`}
            >
              {isCompleted ? (
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12L10 17L20 7"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span
                  className={`text-sm sm:text-base lg:text-2xl font-semibold ${
                    isCurrent ? "text-primary" : "text-[#C4C4C4]"
                  }`}
                >
                  {stepNumber}
                </span>
              )}
            </div>

            {/* Right half line */}
            <div className="flex-1 flex items-center">
              {!isLast && (
                <div
                  className={`w-full h-[2px] ${
                    stepNumber < currentStep ? "bg-primary" : "bg-[#C4C4C4]"
                  }`}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Row 2: Labels */}
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isFuture = stepNumber > currentStep;

        return (
          <span
            key={`label-${index}`}
            className={`mt-1.5 text-[10px] sm:text-xs lg:text-sm font-medium text-center whitespace-nowrap ${
              isFuture ? "text-[#C4C4C4]" : "text-primary"
            }`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
