import type { AgreementApiPayload } from "@/types/agreement";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export async function generateAgreementPdf(payload: AgreementApiPayload, token: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/agreements/generate`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Agreement PDF generation failed (${res.status}): ${body}`);
  }

  const { pdfUrl } = (await res.json()) as { pdfUrl: string };
  return pdfUrl;
}
