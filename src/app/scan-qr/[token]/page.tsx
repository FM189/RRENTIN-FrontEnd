import { getQRScanDetails } from "@/actions/visit-requests";
import Logo from "@/components/ui/Logo";
import ScanConfirmClient from "./ScanConfirmClient";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ScanQRPage({ params }: Props) {
  const { token }  = await params;
  const details    = await getQRScanDetails(token);

  // ── Invalid token ─────────────────────────────────────────────────────────
  if (!details) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg className="h-10 w-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-[#32343C]">Invalid QR Code</p>
            <p className="mt-1 text-sm text-[#969696]">This QR code is not recognised. Please ask the tenant to show a valid QR code.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Already completed ─────────────────────────────────────────────────────
  if (details.status === "completed") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-[#32343C]">Already Confirmed</p>
            <p className="mt-1 text-sm text-[#969696]">
              This visit for <span className="font-semibold">{details.tenantName}</span> has already been marked as complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Cancelled / not accepted ──────────────────────────────────────────────
  if (details.status !== "accepted") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-10 w-10 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-[#32343C]">QR Code Not Active</p>
            <p className="mt-1 text-sm text-[#969696]">This visit request is not in an accepted state. Current status: <span className="font-semibold">{details.status}</span></p>
          </div>
        </div>
      </div>
    );
  }

  // ── Valid — show confirmation UI ──────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">

        {/* Logo */}
        <div className="flex justify-center">
          <Logo variant="blue" size="sm" />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#32343C]">Visit Confirmation</h1>
          <p className="mt-1 text-sm text-[#969696]">
            Confirm that you have shown the complete property to the tenant.
          </p>
        </div>

        {/* Confirmation form (client) */}
        <ScanConfirmClient token={token} details={details} />

        {/* Footer */}
        <p className="text-center text-[11px] text-[#969696]">
          Powered by RRentin · Secure QR Verification
        </p>
      </div>
    </div>
  );
}
