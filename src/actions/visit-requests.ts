"use server";

import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import VisitRequest from "@/models/VisitRequest";
import Transaction from "@/models/Transaction";
import Invoice from "@/models/Invoice";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" });

// ─── Shared serialisable shapes ────────────────────────────────────────────────

export interface VisitRequestSummary {
  id:            string;
  propertyId:    string;
  propertyTitle: string;
  propertyImage: string;
  tenantName:    string;
  preferredDate: string;
  preferredTime: string;
  visitFee:      number;
  total:         number;
  status:        string;
  ownerAction:   string | null;
  qrToken:       string | null;
  createdAt:     string;
}

// ─── Helper: get current user from session ────────────────────────────────────

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthenticated");
  return session.user;
}

// ─── hasActiveVisitRequest ────────────────────────────────────────────────────
// Returns true if the tenant already has a non-terminal visit request for this property.

export async function hasActiveVisitRequest(
  propertyId: string,
  tenantId:   string,
): Promise<boolean> {
  await dbConnect();

  const exists = await VisitRequest.exists({
    propertyId,
    tenantId,
    status: { $nin: ["cancelled", "completed"] },
  });

  return !!exists;
}

// ─── getOwnerVisitRequests ────────────────────────────────────────────────────

export async function getOwnerVisitRequests(
  page = 1,
  statusFilter?: string
): Promise<{ requests: VisitRequestSummary[]; total: number; totalPages: number }> {
  const user = await requireSession();
  await dbConnect();

  const query: Record<string, unknown> = { ownerId: user.id };
  if (statusFilter && statusFilter !== "all") query.status = statusFilter;

  const limit = 10;
  const skip  = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    VisitRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("propertyId", "propertyTitle photos")
      .lean(),
    VisitRequest.countDocuments(query),
  ]);

  const requests: VisitRequestSummary[] = docs.map((d) => {
    const prop = d.propertyId as unknown as { _id?: unknown; propertyTitle?: string; photos?: string[] } | null;
    return {
      id:            String(d._id),
      propertyId:    String(prop?._id ?? d.propertyId),
      propertyTitle: prop?.propertyTitle ?? "",
      propertyImage: prop?.photos?.[0] ?? "",
      tenantName:    d.tenantInfo?.fullName ?? "",
      preferredDate: d.preferredDate ?? "",
      preferredTime: d.preferredTime ?? "",
      visitFee:      d.visitFee ?? 0,
      total:         d.feeBreakdown?.total ?? 0,
      status:        d.status ?? "",
      ownerAction:   d.ownerAction ?? null,
      qrToken:       null, // never expose to owner list
      createdAt:     d.createdAt?.toISOString() ?? "",
    };
  });

  return { requests, total, totalPages: Math.ceil(total / limit) };
}

// ─── getTenantVisitRequests ───────────────────────────────────────────────────

export async function getTenantVisitRequests(
  page         = 1,
  statusFilter?: string,
): Promise<{ requests: VisitRequestSummary[]; total: number; totalPages: number }> {
  const user = await requireSession();
  await dbConnect();

  const query: Record<string, unknown> = { tenantId: user.id };
  if (statusFilter) query.status = statusFilter;
  const limit = 10;
  const skip  = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    VisitRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("propertyId", "propertyTitle photos")
      .lean(),
    VisitRequest.countDocuments(query),
  ]);

  const requests: VisitRequestSummary[] = docs.map((d) => {
    const prop = d.propertyId as unknown as { _id?: unknown; propertyTitle?: string; photos?: string[] } | null;
    return {
      id:            String(d._id),
      propertyId:    String(prop?._id ?? d.propertyId),
      propertyTitle: prop?.propertyTitle ?? "",
      propertyImage: prop?.photos?.[0] ?? "",
      tenantName:    d.tenantInfo?.fullName ?? "",
      preferredDate: d.preferredDate ?? "",
      preferredTime: d.preferredTime ?? "",
      visitFee:      d.visitFee ?? 0,
      total:         d.feeBreakdown?.total ?? 0,
      status:        d.status ?? "",
      ownerAction:   d.ownerAction ?? null,
      // Only include qrToken when accepted
      qrToken:       d.status === "accepted" ? (d.qrToken ?? null) : null,
      createdAt:     d.createdAt?.toISOString() ?? "",
    };
  });

  return { requests, total, totalPages: Math.ceil(total / limit) };
}

// ─── ownerAcceptRequest ───────────────────────────────────────────────────────

export async function ownerAcceptRequest(
  id: string,
  action: "show_self" | "hire_new_agent" | "hire_existing_agent",
  agentId?: string
): Promise<void> {
  const user = await requireSession();
  await dbConnect();

  const doc = await VisitRequest.findById(id);
  if (!doc) throw new Error("Visit request not found");
  if (String(doc.ownerId) !== user.id) throw new Error("Forbidden");

  const qrToken = crypto.randomUUID();

  await VisitRequest.findByIdAndUpdate(id, {
    ownerAction:     action,
    assignedAgentId: agentId ?? null,
    qrToken,
    status:          "accepted",
  });
}

// ─── scanQRCode ───────────────────────────────────────────────────────────────

export async function scanQRCode(token: string): Promise<{ success: boolean }> {
  await dbConnect();

  const doc = await VisitRequest.findOne({ qrToken: token });
  if (!doc) throw new Error("Invalid QR token");
  if (doc.status !== "accepted") throw new Error("QR code already used or visit not accepted");

  // Mark completed
  doc.status      = "completed";
  doc.qrScannedAt = new Date();
  await doc.save();

  // Release escrow — transfer to owner's Stripe account
  const owner = await User.findById(doc.ownerId).select("stripeAccountId").lean();
  if (owner?.stripeAccountId) {
    const visitFee    = doc.visitFee ?? 0;
    const amountCents = Math.round(visitFee * 100);

    const transfer = await stripe.transfers.create({
      amount:      amountCents,
      currency:    "thb",
      destination: owner.stripeAccountId,
      metadata:    { visitRequestId: String(doc._id) },
    });

    const now = new Date();

    await Promise.all([
      // Update visit request escrow state
      VisitRequest.findByIdAndUpdate(doc._id, {
        "escrow.status":           "released",
        "escrow.stripeTransferId": transfer.id,
        "escrow.releasedAt":       now,
      }),
      // Mark the escrow_hold transaction as completed
      Transaction.findOneAndUpdate(
        { referenceId: doc._id, referenceType: "visit_request", type: "escrow_hold" },
        { status: "completed" }
      ),
      // Record the escrow release
      Transaction.create({
        type:          "escrow_release",
        userId:        doc.ownerId,
        referenceId:   doc._id,
        referenceType: "visit_request",
        propertyId:    doc.propertyId,
        amount:        visitFee,
        stripeRef:     transfer.id,
        status:        "completed",
        description:   `Escrow released to owner for visit request ${doc._id}`,
      }),
    ]);
  }

  return { success: true };
}

// ─── getAvailableAgents ───────────────────────────────────────────────────────

export interface AgentSummary {
  id:           string;
  firstName:    string;
  lastName:     string;
  serviceType:  string;
  experienceLevel: string;
  basePrice:    number;
  isPreviouslyUsed: boolean;
}

export async function getAvailableAgents(): Promise<AgentSummary[]> {
  const user = await requireSession();
  await dbConnect();

  // Platform showing agents
  const platformAgents = await User.find({
    role: "service_provider",
    serviceType: "showing_agent",
  })
    .select("firstName lastName serviceType experienceLevel showingBasePrice")
    .lean();

  // Previously used agent IDs for this owner
  const pastRequests = await VisitRequest.find({
    ownerId:         user.id,
    assignedAgentId: { $ne: null },
  })
    .select("assignedAgentId")
    .lean();

  const usedAgentIds = new Set(
    pastRequests.map((r) => String(r.assignedAgentId))
  );

  return platformAgents.map((a) => ({
    id:               String(a._id),
    firstName:        a.firstName,
    lastName:         a.lastName,
    serviceType:      a.serviceType ?? "showing_agent",
    experienceLevel:  a.experienceLevel ?? "entry",
    basePrice:        a.showingBasePrice ?? 0,
    isPreviouslyUsed: usedAgentIds.has(String(a._id)),
  }));
}

// ─── cancelVisitRequest ───────────────────────────────────────────────────────

export async function cancelVisitRequest(id: string): Promise<void> {
  const user = await requireSession();
  await dbConnect();

  const doc = await VisitRequest.findById(id);
  if (!doc) throw new Error("Visit request not found");

  const isOwner  = String(doc.ownerId)  === user.id;
  const isTenant = String(doc.tenantId) === user.id;
  if (!isOwner && !isTenant) throw new Error("Forbidden");

  let stripeRefundId = "";

  if (doc.payment?.stripePaymentIntentId && doc.payment.status === "paid") {
    const refund = await stripe.refunds.create({
      payment_intent: doc.payment.stripePaymentIntentId,
    });
    stripeRefundId = refund.id;
  }

  const totalPaid = doc.feeBreakdown?.total ?? 0;

  await Promise.all([
    VisitRequest.findByIdAndUpdate(id, {
      status:           "cancelled",
      "payment.status": "refunded",
      "escrow.status":  "refunded",
    }),
    // Mark the escrow_hold transaction as failed
    Transaction.findOneAndUpdate(
      { referenceId: doc._id, referenceType: "visit_request", type: "escrow_hold" },
      { status: "failed" }
    ),
    // Cancel the invoice
    Invoice.findOneAndUpdate(
      { referenceId: doc._id, referenceType: "visit_request", status: "issued" },
      { status: "cancelled", cancelledAt: new Date() }
    ),
    // Record refund transaction for tenant (only if payment was made)
    ...(totalPaid > 0 ? [Transaction.create({
      type:          "refund",
      userId:        doc.tenantId,
      referenceId:   doc._id,
      referenceType: "visit_request",
      propertyId:    doc.propertyId,
      amount:        totalPaid,
      stripeRef:     stripeRefundId || doc.payment?.stripePaymentIntentId || "",
      status:        "completed",
      description:   `Refund for cancelled visit request ${doc._id}`,
    })] : []),
  ]);
}
