"use client";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${
                  isActive ? "bg-[#0245A5]" : "bg-[#74757B]"
                }`}
              >
                <span className="text-white text-lg lg:text-2xl font-semibold">
                  {stepNumber}
                </span>
              </div>
              {/* Label */}
              <span
                className={`mt-2 text-xs lg:text-sm font-medium text-center whitespace-nowrap ${
                  isActive ? "text-[#0245A5]" : "text-[#74757B]"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div className="w-16 lg:w-30 h-[1.7px] bg-[#74757B] mb-5 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}
