"use client";

import { useRef, useEffect } from "react";
import ReactSignatureCanvas from "react-signature-canvas";

interface Props {
  onChange:      (dataUrl: string | null) => void;
  height?:       number;
  placeholder?:  string;
  clearLabel?:   string;
}

// Crop the canvas to the bounding box of drawn content (with padding).
// This removes empty whitespace so the signature fills the PDF box properly.
function getTrimmedDataUrl(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) return canvas.toDataURL("image/png");

  const pad = 12;
  minX = Math.max(0, minX - pad);
  maxX = Math.min(width  - 1, maxX + pad);
  minY = Math.max(0, minY - pad);
  maxY = Math.min(height - 1, maxY + pad);

  const trimW = maxX - minX + 1;
  const trimH = maxY - minY + 1;

  const out    = document.createElement("canvas");
  out.width    = trimW;
  out.height   = trimH;
  const outCtx = out.getContext("2d")!;
  outCtx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
  return out.toDataURL("image/png");
}

export default function SignatureCanvas({ onChange, height = 120, placeholder = "", clearLabel = "" }: Props) {
  const padRef       = useRef<ReactSignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale the canvas to the device pixel ratio so signatures render crisp in PDFs
  useEffect(() => {
    const sigPad = padRef.current;
    const canvas = sigPad?.getCanvas();
    if (!canvas || !containerRef.current) return;
    const dpr  = window.devicePixelRatio || 1;
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width  = Math.round(rect.width  * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.getContext("2d")?.scale(dpr, dpr);
    sigPad?.clear(); // re-sync signature_pad internal state after canvas resize
  }, []);

  const handleEnd = () => {
    if (padRef.current?.isEmpty()) {
      onChange(null);
    } else {
      onChange(getTrimmedDataUrl(padRef.current!.getCanvas()));
    }
  };

  const handleClear = () => {
    padRef.current?.clear();
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="relative rounded-[6px] border border-[rgba(102,102,102,0.35)] bg-white overflow-hidden"
        style={{ height }}
      >
        <ReactSignatureCanvas
          ref={padRef}
          penColor="#000000"
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
