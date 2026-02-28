import Invoice from "@/models/Invoice";
import type { IInvoice } from "@/models/Invoice";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/**
 * Calls the backend to generate a PDF for the given invoice,
 * uploads it to S3, then stores the returned URL in the Invoice document.
 *
 * Safe to fire-and-forget (errors are logged but don't break the caller).
 */
export async function generateAndStoreInvoicePdf(invoice: IInvoice): Promise<void> {
  try {
    const res = await fetch(`${BACKEND_URL}/invoices/generate-pdf`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        referenceType: invoice.referenceType,
        issuedTo:      invoice.issuedTo,
        issuedBy:      invoice.issuedBy,
        lineItems:     invoice.lineItems,
        subtotal:      invoice.subtotal,
        vatTotal:      invoice.vatTotal,
        total:         invoice.total,
        currency:      invoice.currency,
        stripeRef:     invoice.stripeRef,
        status:        invoice.status,
        issuedAt:      invoice.issuedAt?.toISOString?.() ?? new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Backend returned ${res.status}: ${body}`);
    }

    const { pdfUrl } = (await res.json()) as { pdfUrl: string };

    await Invoice.findByIdAndUpdate(invoice._id, { pdfUrl });

    console.log(`[Invoice] PDF stored: ${pdfUrl}`);
  } catch (err) {
    console.error("[Invoice] PDF generation failed:", err);
    // Non-fatal — invoice record still exists, PDF can be regenerated later
  }
}
