"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, Stepper } from "@/components/ui";
import Step1BasicInfo from "@/components/onboarding/Step1BasicInfo";
import Step2ServiceArea from "@/components/onboarding/Step2ServiceArea";
import Step3PricingDetails from "@/components/onboarding/Step3PricingDetails";
import {
  OnboardingData,
  INITIAL_ONBOARDING_DATA,
  ONBOARDING_STORAGE_KEY,
} from "@/types/onboarding";
import { serviceProviderSignUpAction } from "@/actions/service-provider-signup";

export default function ServiceProviderOnboardingPage() {
  const t = useTranslations("ServiceProviderOnboarding");
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);
  const hasInitialized = useRef(false);

  // Load carried-over data from sessionStorage on mount, redirect if none
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const stored = sessionStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setFormData((prev) => ({ ...prev, ...parsed }));
      sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } else {
      router.replace("/signup");
    }
  }, [router]);

  const stepLabels = [
    t("steps.basicInfo"),
    t("steps.serviceArea"),
    t("steps.pricingDetail"),
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSignup = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    const result = await serviceProviderSignUpAction({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      experienceLevel: formData.experienceLevel,
      serviceType: formData.serviceType,
      hasNoLicense: formData.hasNoLicense,
      country: formData.country,
      stateProvince: formData.stateProvince,
      city: formData.city,
      area: formData.area,
      availableDays: formData.availableDays,
      availableHoursOpen: formData.availableHoursOpen,
      availableHoursClose: formData.availableHoursClose,
      showingBasePrice: formData.showingBasePrice,
      inspectionBasePrice: formData.inspectionBasePrice,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.push("/login");
    } else {
      setSubmitError(result.error ? t(`errors.${result.error}`) : t("errors.serverError"));
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{
        backgroundImage: `
          linear-gradient(0deg, rgba(3, 69, 165, 0.19), rgba(3, 69, 165, 0.19)),
          linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
          url('/images/auth/sign-up.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Logo */}
      <div className="pt-4 lg:pt-6 pb-4 self-start pl-6 lg:pl-10">
        <Logo variant="white" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-302.25 mx-4 bg-white rounded-[10px] shadow-[0px_0px_14px_rgba(0,0,0,0.09)] flex flex-col items-center px-4 sm:px-6 lg:px-10 py-6 lg:py-7.5 gap-5 lg:gap-6">
        {/* Title */}
        <h1 className="text-lg lg:text-[22px] font-semibold leading-6.5 capitalize text-[#32343C]">
          {t("title")}
        </h1>

        {/* Stepper */}
        <Stepper steps={stepLabels} currentStep={currentStep} />

        {/* Step Content */}
        {currentStep === 1 && (
          <Step1BasicInfo
            formData={formData}
            onChange={handleInputChange}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2ServiceArea
            formData={formData}
            onChange={handleInputChange}
            onNext={() => setCurrentStep(3)}
            onPrevious={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3PricingDetails
            formData={formData}
            onChange={handleInputChange}
            onPrevious={() => setCurrentStep(2)}
            onSubmit={handleSignup}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>

      {/* Already have an account */}
      <div className="py-4">
        <p className="text-base text-white">
          {t.rich("alreadyHaveAccount", {
            loginLink: (chunks) => (
              <Link href="/login" className="underline text-primary font-medium">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </div>
  );
}
