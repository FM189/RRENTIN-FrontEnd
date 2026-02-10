"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Checkbox,
  Select,
  PhoneInput,
  Logo,
} from "@/components/ui";
import Link from "next/link";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    registerAs: "",
    agreeTerms: false,
    agreeMarketing: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const registerOptions = [
    { value: "tenant", label: "Tenant" },
    { value: "owner", label: "Owner" },
    { value: "service-provider", label: "Service Provider" },
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
      {/* Mobile Logo - On background, not white card */}
      <div className="lg:hidden flex justify-center pt-6 pb-4">
        <Logo variant="white" />
      </div>

      {/* Left Content - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 xl:p-15">
        {/* Logo - Top */}
        <Logo variant="white" />

        {/* Welcome Text - Center */}
        <div className="max-w-154.5 flex flex-col gap-6">
          <h1 className="text-[42px] leading-[100%] tracking-[0.02em] text-white">
            <span className="font-black">Welcome</span> to Rrentin – Your Key to a Perfect Home!
          </h1>
          <p className="text-2xl font-medium leading-8 tracking-normal text-white/80">
            Join Rrentin and explore a world of exclusive benefits. Find your
            dream home effortlessly—sign up in just a few steps!
          </p>
        </div>

        {/* Spacer for bottom */}
        <div></div>
      </div>

      {/* Right Side - Sign Up Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-177.5 bg-white rounded-xl border border-[rgba(102,102,102,0.5)] py-5 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-22">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:gap-5">
            {/* Heading */}
            <h2 className="text-2xl sm:text-[32px] font-semibold leading-tight sm:leading-9.5 text-[#32343C]">
              Sign up now
            </h2>

            {/* Form Fields */}
            <div className="flex flex-col gap-3">
              {/* Name Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  label="First name"
                  name="firstName"
                  placeholder=""
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <Input
                  label="Last name"
                  name="lastName"
                  placeholder=""
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              {/* Email with Verify Button */}
              <div className="flex flex-col gap-1">
                <label className="text-sm lg:text-base text-[#666666] font-normal leading-4.75">
                  Email address
                </label>
                <div className="flex flex-col xl:flex-row gap-3">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ minHeight: '48px' }}
                    className="w-full xl:flex-1 h-12 lg:h-14 px-4 lg:px-6 border border-[rgba(102,102,102,0.35)] rounded-xl text-sm lg:text-base text-[#333333] placeholder:text-[rgba(102,102,102,0.6)] bg-white transition-colors duration-200 hover:border-[rgba(102,102,102,0.5)] focus:border-[#0245A5] focus:outline-none"
                  />
                  <button
                    type="button"
                    style={{ minHeight: '48px' }}
                    className="w-full xl:w-auto h-12 lg:h-14 px-6 bg-[#0245A5] text-white text-base lg:text-xl font-medium rounded-xl hover:bg-[#023a8a] transition-colors whitespace-nowrap shrink-0"
                  >
                    Verify Email
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <PhoneInput
                label="Phone number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder=""
              />

              {/* Password */}
              <Input
                label="Password"
                name="password"
                type="password"
                showPasswordToggle
                value={formData.password}
                onChange={handleChange}
              />

              {/* Register As */}
              <Select
                label="Register As"
                name="registerAs"
                value={formData.registerAs}
                onChange={handleChange}
                options={registerOptions}
                placeholder="Select"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-3">
              <Checkbox
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                label={
                  <>
                    By creating an account, I agree to our{" "}
                    <Link
                      href="/terms"
                      className="underline text-[#333333]"
                    >
                      Terms of use
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="underline text-[#333333]"
                    >
                      Privacy Policy
                    </Link>
                  </>
                }
              />
              <Checkbox
                name="agreeMarketing"
                checked={formData.agreeMarketing}
                onChange={handleChange}
                label="By creating an account, I am also consenting to receive SMS messages and emails, including product new feature updates, events, and marketing promotions."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Button
                type="submit"
                size="lg"
                className="text-lg sm:text-xl font-medium w-full sm:w-auto min-w-41 whitespace-nowrap"
                disabled={!formData.agreeTerms}
              >
                Sign up
              </Button>
              <p className="text-sm sm:text-base text-[#333333]">
                Already have an Account?{" "}
                <Link
                  href="/login"
                  className="underline font-medium"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
