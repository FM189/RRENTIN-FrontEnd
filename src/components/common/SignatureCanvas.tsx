"use client";

import { useRef } from "react";
import ReactSignatureCanvas from "react-signature-canvas";

interface Props {
  onChange:      (dataUrl: string | null) => void;
  height?:       number;
  placeholder?:  string;
  clearLabel?:   string;
}

export default function SignatureCanvas({ onChange, height = 120, placeholder = "", clearLabel = "" }: Props) {
  const padRef = useRef<ReactSignatureCanvas>(null);

  const handleEnd = () => {
    if (padRef.current?.isEmpty()) {
      onChange(null);
    } else {
      onChange(padRef.current!.toDataURL("image/png"));
    }
  };

  const handleClear = () => {
    padRef.current?.clear();
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative rounded-[6px] border border-[rgba(102,102,102,0.35)] bg-white overflow-hidden"
        style={{ height }}
      >
        <ReactSignatureCanvas
          ref={padRef}
          penColor="#32343C"
          canvasProps={{
            style: { width: "100%", height: "100%" },
            className: "cursor-crosshair",
          }}
          onEnd={handleEnd}
        />
        {placeholder && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[rgba(102,102,102,0.4)] select-none">
            {placeholder}
          </p>
        )}
      </div>
      {clearLabel && (
        <button
          type="button"
          onClick={handleClear}
          className="self-end text-xs text-[#EE1D52] underline"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
