"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Input,
  Checkbox,
  Select,
  PhoneInput,
  Logo,
} from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction, checkEmailExists, checkPhoneExists, SignUpResult } from "@/actions/signup";
import { FieldErrors } from "@/lib/validations/signup";

const ONBOARDING_STORAGE_KEY = "rrentin_sp_onboarding";

export default function SignUpPage() {
  const t = useTranslations("SignUp");
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    fullPhone: "",
    password: "",
    registerAs: "",
    agreeTerms: false,
    agreeMarketing: false,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear field error on change
    const errorKey = name === "registerAs" ? "role" : name;
    if (fieldErrors[errorKey as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setSuccessMessage("");
    setIsLoading(true);

    // Service providers go to multi-step onboarding
    if (formData.registerAs === "service_provider") {
      const errors: FieldErrors = {};
      if (!formData.firstName.trim()) errors.firstName = "firstNameRequired";
      if (!formData.lastName.trim()) errors.lastName = "lastNameRequired";
      if (!formData.email.trim()) errors.email = "emailRequired";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "emailInvalid";
      if (!formData.fullPhone.trim()) errors.phone = "phoneRequired";
      if (!formData.password) errors.password = "passwordRequired";
      else if (formData.password.length < 8) errors.password = "passwordMinLength";
      if (!formData.agreeTerms) errors.agreeTerms = "termsRequired";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setIsLoading(false);
        return;
      }

      // Check if email or phone already exists before redirecting
      const [emailExists, phoneExists] = await Promise.all([
        checkEmailExists(formData.email),
        checkPhoneExists(formData.fullPhone),
      ]);

      if (emailExists || phoneExists) {
        const dupErrors: FieldErrors = {};
        if (emailExists) dupErrors.email = "emailExists";
        if (phoneExists) dupErrors.phone = "phoneExists";
        setFieldErrors(dupErrors);
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.fullPhone,
          password: formData.password,
        })
      );
      router.push("/service-provider/onboarding");
      return;
    }

    const result: SignUpResult = await signUpAction({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.fullPhone,
      password: formData.password,
      role: formData.registerAs,
      agreeTerms: formData.agreeTerms,
    });

    setIsLoading(false);

    if (result.success) {
      router.push("/login");
      return;
    } else if (result.errors) {
      setFieldErrors(result.errors);
    }
  };

  const getError = (field: keyof FieldErrors): string | undefined => {
    const errorKey = fieldErrors[field];
    if (!errorKey) return undefined;
    return t(`errors.${errorKey}`);
  };

  const registerOptions = [
    { value: "tenant", label: t("roleTenant") },
    { value: "owner", label: t("roleOwner") },
    { value: "service_provider", label: t("roleServiceProvider") },
  ];

  return (
    <div
      className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row"
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
      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center pt-6 pb-4">
        <Logo variant="white" />
      </div>

      {/* Left Content - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 xl:p-15">
        <Logo variant="white" />

        <div className="max-w-154.5 flex flex-col gap-6">
          <h1 className="text-[42px] leading-[100%] tracking-[0.02em] text-white">
            {t.rich("welcomeTitle", {
              bold: (chunks) => <span className="font-black">{chunks}</span>,
            })}
          </h1>
          <p className="text-2xl font-medium leading-8 tracking-normal text-white/80">
            {t("welcomeSubtitle")}
          </p>
        </div>

        <div></div>
      </div>

      {/* Right Side - Sign Up Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-177.5 bg-white rounded-xl border border-[rgba(102,102,102,0.5)] py-5 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-22">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:gap-5">
            <h2 className="text-2xl sm:text-[32px] font-semibold leading-tight sm:leading-9.5 text-[#32343C]">
              {t("heading")}
            </h2>

            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {successMessage}
              </div>
            )}

            {/* Form Fields */}
            <div className="flex flex-col gap-3">
              {/* Name Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  label={t("firstName")}
                  name="firstName"
                  placeholder=""
                  value={formData.firstName}
                  onChange={handleChange}
                  error={getError("firstName")}
                />
                <Input
                  label={t("lastName")}
                  name="lastName"
                  placeholder=""
                  value={formData.lastName}
                  onChange={handleChange}
                  error={getError("lastName")}
                />
              </div>

              {/* Email with Verify Button */}
              <div className="flex flex-col gap-1">
                <label className="text-sm lg:text-base text-[#666666] font-normal leading-4.75">
                  {t("emailAddress")}
                </label>
                <div className="flex flex-col xl:flex-row gap-3">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ minHeight: "48px" }}
                    className={`w-full xl:flex-1 h-12 lg:h-14 px-4 lg:px-6 border rounded-xl text-sm lg:text-base text-[#333333] placeholder:text-[rgba(102,102,102,0.6)] bg-white transition-colors duration-200 hover:border-[rgba(102,102,102,0.5)] focus:border-[#0245A5] focus:outline-none ${
                      fieldErrors.email
                        ? "border-error"
                        : "border-[rgba(102,102,102,0.35)]"
                    }`}
                  />
                  <button
                    type="button"
                    style={{ minHeight: "48px" }}
                    className="w-full xl:w-auto h-12 lg:h-14 px-6 bg-[#0245A5] text-white text-base lg:text-xl font-medium rounded-xl hover:bg-[#023a8a] transition-colors whitespace-nowrap shrink-0"
                  >
                    {t("verifyEmail")}
                  </button>
                </div>
                {fieldErrors.email && (
                  <span className="text-sm text-error font-normal">
                    {getError("email")}
                  </span>
                )}
              </div>

              {/* Phone Number */}
              <PhoneInput
                label={t("phoneNumber")}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onPhoneChange={(fullNumber) =>
                  setFormData((prev) => ({ ...prev, fullPhone: fullNumber }))
                }
                placeholder=""
                error={getError("phone")}
              />

              {/* Password */}
              <Input
                label={t("password")}
                name="password"
                type="password"
                showPasswordToggle
                value={formData.password}
                onChange={handleChange}
                error={getError("password")}
              />

              {/* Register As */}
              <Select
                label={t("registerAs")}
                name="registerAs"
                value={formData.registerAs}
                onChange={handleChange}
                options={registerOptions}
                placeholder={t("selectPlaceholder")}
                error={getError("role")}
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-3">
              <Checkbox
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                label={t.rich("termsCheckbox", {
                  termsLink: (chunks) => (
                    <Link
                      href="/terms"
                      className="underline text-[#333333]"
                    >
                      {chunks}
                    </Link>
                  ),
                  privacyLink: (chunks) => (
                    <Link
                      href="/privacy"
                      className="underline text-[#333333]"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
                error={
                  fieldErrors.agreeTerms
                    ? t(`errors.${fieldErrors.agreeTerms}`)
                    : undefined
                }
              />
              <Checkbox
                name="agreeMarketing"
                checked={formData.agreeMarketing}
                onChange={handleChange}
                label={t("marketingCheckbox")}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Button
                type="submit"
                size="lg"
                className="text-lg sm:text-xl font-medium w-full sm:w-auto min-w-41 whitespace-nowrap"
                disabled={!formData.agreeTerms}
                isLoading={isLoading}
              >
                {t("signUpButton")}
              </Button>
              <p className="text-sm sm:text-base text-[#333333]">
                {t.rich("alreadyHaveAccount", {
                  loginLink: (chunks) => (
                    <Link href="/login" className="underline font-medium">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
