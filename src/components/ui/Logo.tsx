import Link from "next/link";

interface LogoProps {
  variant?: "white" | "blue";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({ variant = "blue", size = "lg", showText = true, className = "" }: LogoProps) {
  const logoSrc =
    variant === "white"
      ? "/images/logo/rrentin-white-logo.png"
      : "/images/logo/rrentin-blue-logo.png";

  const textSrc =
    variant === "white"
      ? "/images/logo/rrentin-white-text.png"
      : "/images/logo/rrentin-black-text.png";

  const sizes = {
    sm: {
      logo: "w-[38px] h-[34px]",
      text: "h-[21px]",
      gap: "gap-1.5",
    },
    md: {
      logo: "w-10 h-10",
      text: "h-6",
      gap: "gap-2",
    },
    lg: {
      logo: "w-10 h-10 lg:w-[60px] lg:h-[60px]",
      text: "h-6 lg:h-9",
      gap: "gap-2",
    },
  };

  const currentSize = sizes[size];

  const textMargin = size === "sm" ? "" : "mb-1";

  return (
    <Link href="/" className={`flex items-end ${currentSize.gap} ${className}`}>
      <img
        src={logoSrc}
        alt="RRentin Logo"
        className={`${currentSize.logo} object-contain`}
      />
      {showText && (
        <img
          src={textSrc}
          alt="RRentin"
          className={`${currentSize.text} object-contain ${textMargin}`}
        />
      )}
    </Link>
  );
}
