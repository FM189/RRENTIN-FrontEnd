"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Logo from "@/components/ui/Logo";
import LocaleSelect from "@/components/ui/LocaleSelect";

interface NavItem {
  key: string;
  href: string;
  hasDropdown?: boolean;
  children?: { key: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    key: "home",
    href: "/",
    hasDropdown: true,
    children: [
      { key: "featuredProperties", href: "/featured" },
      { key: "newListings", href: "/new-listings" },
    ],
  },
  {
    key: "blog",
    href: "/blog",
    hasDropdown: true,
    children: [
      { key: "allPosts", href: "/blog" },
      { key: "tipsGuides", href: "/blog/tips" },
      { key: "marketNews", href: "/blog/news" },
    ],
  },
  {
    key: "contactUs",
    href: "/contact",
    hasDropdown: true,
    children: [
      { key: "getInTouch", href: "/contact" },
      { key: "support", href: "/support" },
      { key: "faq", href: "/faq" },
    ],
  },
];

export default function Header() {
  const t = useTranslations("Header");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");

  const handleDropdownToggle = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <header className="bg-white border-b border-[rgba(255,255,255,0.07)]">
      <div className="w-full px-4 sm:px-8 lg:px-29">
        <div className="flex items-center justify-between h-22.25">
          {/* Logo - Left */}
          <div className="relative">
            {/* Blue blur effect behind logo */}
            <div
              className="absolute -left-1 -top-0.5 w-11 h-9 rounded-[50px] blur-[37px]"
              style={{ background: "#D0DDFF" }}
            />
            <Logo variant="blue" size="sm" />
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-3 fixed left-1/2 -translate-x-1/2 top-0 h-22.25">
            {navItems.map((item) => (
              <div key={item.key} className="relative">
                <button
                  onClick={() => {
                    handleDropdownToggle(item.key);
                    setActiveNav(item.key);
                  }}
                  className={`flex items-center gap-2.25 px-4.5 py-2.5 h-11.75 rounded-xl text-sm font-medium capitalize transition-colors ${
                    activeNav === item.key
                      ? "bg-[#F7F7F7] font-semibold"
                      : "bg-transparent font-medium hover:bg-[#F7F7F7]/50"
                  }`}
                  style={{ color: "#181A20" }}
                >
                  {t(item.key)}
                  {item.hasDropdown && (
                    <svg
                      width="8"
                      height="4"
                      viewBox="0 0 8 4"
                      fill="none"
                      className={`transition-transform ${
                        openDropdown === item.key ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M0 0L4 4L8 0H0Z"
                        fill="#181A20"
                      />
                    </svg>
                  )}
                </button>

                {/* Dropdown Menu */}
                {item.hasDropdown && openDropdown === item.key && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-45">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-[#181A20] hover:bg-[#F7F7F7] capitalize transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {t(child.key)}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side - Auth & Locale */}
          <div className="flex items-center gap-6">
            {/* Locale Selector */}
            <LocaleSelect className="hidden sm:block" />

            {/* Auth Links - Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/signup"
                className="text-sm font-medium tracking-[0.18px] text-[#32343C] hover:text-[#0245A5] transition-colors"
              >
                {t("signUp")}
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center px-4.5 py-3.5 h-11 bg-[#0245A5] text-white text-sm font-medium tracking-[0.18px] rounded hover:bg-[#023a8a] transition-colors"
              >
                {t("loginRegister")}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden p-2 text-[#181A20]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <div key={item.key}>
                  <button
                    onClick={() => {
                      handleDropdownToggle(item.key);
                      setActiveNav(item.key);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium capitalize rounded-lg ${
                      activeNav === item.key
                        ? "bg-[#F7F7F7] font-semibold"
                        : ""
                    }`}
                    style={{ color: "#181A20" }}
                  >
                    {t(item.key)}
                    {item.hasDropdown && (
                      <svg
                        width="8"
                        height="4"
                        viewBox="0 0 8 4"
                        fill="none"
                        className={`transition-transform ${
                          openDropdown === item.key ? "rotate-180" : ""
                        }`}
                      >
                        <path d="M0 0L4 4L8 0H0Z" fill="#181A20" />
                      </svg>
                    )}
                  </button>
                  {item.hasDropdown && openDropdown === item.key && (
                    <div className="pl-4 pb-2">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-[#666666] hover:text-[#0245A5] capitalize"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {t(child.key)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Auth Links */}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100 px-4">
              <Link
                href="/signup"
                className="text-sm font-medium text-[#32343C] hover:text-[#0245A5]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("signUp")}
              </Link>
              <Link
                href="/login"
                className="w-full py-3 bg-[#0245A5] text-white text-sm font-medium rounded text-center hover:bg-[#023a8a] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("loginRegister")}
              </Link>
            </div>

            {/* Mobile Locale */}
            <div className="sm:hidden mt-4 pt-4 border-t border-gray-100 px-4">
              <LocaleSelect />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
