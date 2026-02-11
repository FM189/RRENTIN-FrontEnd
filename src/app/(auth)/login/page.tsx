"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Button, Input, Logo } from "@/components/ui";
import Link from "next/link";
import { LoginFieldErrors } from "@/actions/login";

export default function LoginPage() {
  const t = useTranslations("Login");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof LoginFieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);

    const errors: LoginFieldErrors = {};
    if (!formData.email.trim()) {
      errors.email = "emailRequired";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "emailInvalid";
    }
    if (!formData.password) {
      errors.password = "passwordRequired";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.ok) {
      window.location.href = "/dashboard";
    } else {
      setFieldErrors({ email: "invalidCredentials" });
    }
  };

  const getError = (field: keyof LoginFieldErrors): string | undefined => {
    const errorKey = fieldErrors[field];
    if (!errorKey) return undefined;
    return t(`errors.${errorKey}`);
  };

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
          <h1 className="text-[42px] leading-[100%] tracking-[0.02em] font-bold text-white">
            {t("welcomeTitle")}
          </h1>
          <p className="text-2xl font-medium leading-8 tracking-normal text-white/80">
            {t("welcomeSubtitle")}
          </p>
        </div>

        <div></div>
      </div>

      {/* Right Side - Login Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-177.5 bg-white rounded-xl border border-[rgba(102,102,102,0.5)] py-5 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-22">
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <h2 className="text-2xl sm:text-[32px] font-semibold leading-tight sm:leading-9.5 text-[#32343C]">
              {t("heading")}
            </h2>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              <Input
                label={t("emailAddress")}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={getError("email")}
              />

              <Input
                label={t("password")}
                name="password"
                type="password"
                showPasswordToggle
                value={formData.password}
                onChange={handleChange}
                error={getError("password")}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Button
                type="submit"
                size="lg"
                className="text-lg sm:text-xl font-medium w-full sm:w-auto min-w-41 whitespace-nowrap"
                isLoading={isLoading}
              >
                {t("loginButton")}
              </Button>
              <p className="text-sm sm:text-base text-[#333333]">
                {t.rich("noAccount", {
                  signUpLink: (chunks) => (
                    <Link href="/signup" className="underline text text-primary font-medium">
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
