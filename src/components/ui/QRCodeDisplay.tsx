"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  token:       string;
  instruction: string;
}

export default function QRCodeDisplay({ token, instruction }: QRCodeDisplayProps) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/api/scan-qr/${token}`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-[#0245A5]/20 bg-[#E8F2FF] p-5">
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <QRCodeSVG
          value={url}
          size={160}
          bgColor="#ffffff"
          fgColor="#0245A5"
          level="H"
          includeMargin={false}
        />
      </div>
      <p className="max-w-[240px] text-center text-xs leading-relaxed text-[#0245A5]">
        {instruction}
      </p>
    </div>
  );
}
