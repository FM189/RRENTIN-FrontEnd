import Stripe from "stripe";
import VisitRequest from "@/models/VisitRequest";
import Transaction from "@/models/Transaction";
import Invoice, { nextInvoiceNumber } from "@/models/Invoice";
import User from "@/models/User";
import { generateAndStoreInvoicePdf } from "@/lib/invoiceApi";

export async function handleVisitPaymentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const referenceId = pi.metadata?.visitRequestId;
  if (!referenceId) return;

  const doc = await VisitRequest.findByIdAndUpdate(
    referenceId,
    {
      "payment.status": "paid",
      "payment.paidAt": new Date(),
      "escrow.status":  "held",
      status:           "payment_confirmed",
    },
    { new: true },
  );

  if (!doc) return;

  const totalPaid = pi.amount / 100;
  const visitFee  = doc.visitFee ?? 0;

  const tenant = await User.findById(doc.tenantId)
    .select("firstName lastName email")
    .lean() as { firstName?: string; lastName?: string; email?: string } | null;

  const tenantName    = tenant ? `${tenant.firstName} ${tenant.lastName}`.trim() : "";
  const invoiceNumber = await nextInvoiceNumber();

  await Promise.all([
    Transaction.insertMany([
      {
        type:          "visit_payment",
        userId:        doc.tenantId,
        referenceId:   doc._id,
        referenceType: "visit_request",
        propertyId:    doc.propertyId,
        amount:        totalPaid,
        stripeRef:     pi.id,
        status:        "completed",
        description:   `Visit payment for property ${doc.propertyId}`,
      },
      {
        type:          "escrow_hold",
        userId:        doc.ownerId,
        referenceId:   doc._id,
        referenceType: "visit_request",
        propertyId:    doc.propertyId,
        amount:        visitFee,
        stripeRef:     pi.id,
        status:        "pending",
        description:   `Escrow hold for visit request ${doc._id}`,
      },
    ]),

    Invoice.create({
      invoiceNumber,
      referenceId:   doc._id,
      referenceType: "visit_request",
      propertyId:    doc.propertyId,
      issuedTo: {
        userId:   doc.tenantId,
        fullName: tenantName,
        email:    tenant?.email ?? "",
      },
      lineItems: [
        {
          description: "Visit Request Service Fee",
          amount:      visitFee,
          vatRate:     0,
          vatAmount:   0,
          total:       visitFee,
        },
      ],
      subtotal:  visitFee,
      vatTotal:  0,
      total:     totalPaid,
      stripeRef: pi.id,
      status:    "issued",
      issuedAt:  new Date(),
    }).then((invoice) => {
      generateAndStoreInvoicePdf(invoice);
    }),
  ]);
}
