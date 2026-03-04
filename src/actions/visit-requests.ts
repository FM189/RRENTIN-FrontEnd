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
import Wallet from "@/models/Wallet";
import PlatformFees from "@/models/PlatformFees";
import { calculateFees } from "@/lib/fees";
import Property from "@/models/Property";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/types/notifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" });

// ─── Shared serialisable shapes ────────────────────────────────────────────────

export interface VisitRequestSummary {
  id:            string;
  propertyId:    string;
  propertyTitle: string;
  propertyImage: string;
  tenantName:    string;
  partyName:     string;   // the other party: tenant name for owner, owner name for tenant
  partyRole:     string;   // "tenant" | "owner"
  preferredDate: string;
  preferredTime: string;
  visitFee:      number;
  total:         number;
  status:        string;
  paymentStatus: string;   // "pending" | "paid" | "refunded"
  ownerAction:   string | null;
  qrToken:       string | null;
  createdAt:     string;
}

export interface VisitRequestDetail {
  id:                string;
  status:            string;
  tenantId:          string;
  // property
  propertyId:        string;
  propertyTitle:     string;
  propertyType:      string;
  propertyImages:    string[];
  propertyAddress:   string;
  rentPrice:         string;
  bedrooms:          number;
  bathrooms:         number;
  unitArea:          string;
  unitAreaUnit:      string;
  showingDates:      string[];
  showingTimeFrom:   string;
  showingTimeTo:     string;
  // tenant info
  tenantName:         string;
  tenantProfileImage: string;
  preferredDate:     string;
  preferredTime:     string;
  nationality:       string;
  numberOfOccupants: string;
  purposeOfRental:   string;
  moveInDate:        string;
  moveOutDate:       string;
  createdAt:         string;
  // payment / fee breakdown (populated at QR scan time)
  visitFee:     number;
  feeBreakdown: { platformFee: number; vat: number; stripeFee: number; total: number };
  qrScannedAt:  string;
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
      partyName:     d.tenantInfo?.fullName ?? "",
      partyRole:     "tenant",
      preferredDate: d.preferredDate ?? "",
      preferredTime: d.preferredTime ?? "",
      visitFee:      d.visitFee ?? 0,
      total:         d.feeBreakdown?.total ?? 0,
      status:        d.status ?? "",
      paymentStatus: d.payment?.status ?? "pending",
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
      .populate("ownerId", "firstName lastName")
      .lean(),
    VisitRequest.countDocuments(query),
  ]);

  const requests: VisitRequestSummary[] = docs.map((d) => {
    const prop  = d.propertyId as unknown as { _id?: unknown; propertyTitle?: string; photos?: string[] } | null;
    const owner = d.ownerId    as unknown as { firstName?: string; lastName?: string } | null;
    const ownerName = owner ? `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() : "";
    return {
      id:            String(d._id),
      propertyId:    String(prop?._id ?? d.propertyId),
      propertyTitle: prop?.propertyTitle ?? "",
      propertyImage: prop?.photos?.[0] ?? "",
      tenantName:    d.tenantInfo?.fullName ?? "",
      partyName:     ownerName,
      partyRole:     "owner",
      preferredDate: d.preferredDate ?? "",
      preferredTime: d.preferredTime ?? "",
      visitFee:      d.visitFee ?? 0,
      total:         d.feeBreakdown?.total ?? 0,
      status:        d.status ?? "",
      paymentStatus: d.payment?.status ?? "pending",
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

// ─── ownerRejectRequest ───────────────────────────────────────────────────────

export async function ownerRejectRequest(id: string): Promise<void> {
  const user = await requireSession();
  await dbConnect();

  const doc = await VisitRequest.findById(id);
  if (!doc) throw new Error("Visit request not found");
  if (String(doc.ownerId) !== user.id) throw new Error("Forbidden");

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
    Transaction.findOneAndUpdate(
      { referenceId: doc._id, referenceType: "visit_request", type: "escrow_hold" },
      { status: "failed" }
    ),
    Invoice.findOneAndUpdate(
      { referenceId: doc._id, referenceType: "visit_request", status: "issued" },
      { status: "cancelled", cancelledAt: new Date() }
    ),
    ...(totalPaid > 0 ? [Transaction.create({
      type:          "refund",
      userId:        doc.tenantId,
      referenceId:   doc._id,
      referenceType: "visit_request",
      propertyId:    doc.propertyId,
      amount:        totalPaid,
      stripeRef:     stripeRefundId || doc.payment?.stripePaymentIntentId || "",
      status:        "completed",
      description:   `Refund for rejected visit request ${doc._id}`,
    })] : []),
  ]);
}

// ─── getOwnerVisitRequestDetail ───────────────────────────────────────────────

export async function getOwnerVisitRequestDetail(id: string): Promise<VisitRequestDetail> {
  const user = await requireSession();
  await dbConnect();

  const doc = await VisitRequest.findById(id).lean();
  if (!doc) throw new Error("Visit request not found");
  if (String(doc.ownerId) !== user.id) throw new Error("Forbidden");

  const [prop, tenant] = await Promise.all([
    Property.findById(doc.propertyId).lean() as Promise<(Record<string, unknown> & {
      propertyTitle?: string;
      propertyType?: string;
      photos?: string[];
      address?: string;
      district?: string;
      province?: string;
      bedrooms?: number;
      bathrooms?: number;
      unitArea?: string;
      unitAreaUnit?: string;
      contracts?: { months: number; rentPrice: string }[];
    }) | null>,
    User.findById(doc.tenantId).select("profileImage").lean() as Promise<{ profileImage?: string } | null>,
  ]);

  const rentPrice = prop?.contracts?.[0]?.rentPrice ?? "";
  const address   = [prop?.address, prop?.district, prop?.province].filter(Boolean).join(", ");

  return {
    id:                String(doc._id),
    status:            doc.status ?? "",
    propertyId:        String(doc.propertyId),
    propertyTitle:     prop?.propertyTitle ?? "",
    propertyType:      prop?.propertyType ?? "",
    propertyImages:    (prop?.photos ?? []) as string[],
    propertyAddress:   address,
    rentPrice,
    bedrooms:          prop?.bedrooms ?? 0,
    bathrooms:         prop?.bathrooms ?? 0,
    unitArea:          prop?.unitArea ?? "",
    unitAreaUnit:      prop?.unitAreaUnit ?? "sqm",
    showingDates:      (prop?.showingDates ?? []) as string[],
    showingTimeFrom:   (prop?.showingTimeFrom as string) ?? "",
    showingTimeTo:     (prop?.showingTimeTo as string) ?? "",
    tenantName:        doc.tenantInfo?.fullName ?? "",
    tenantProfileImage: tenant?.profileImage ?? "",
    preferredDate:     doc.preferredDate ?? "",
    preferredTime:     doc.preferredTime ?? "",
    nationality:       doc.tenantInfo?.nationality ?? "",
    numberOfOccupants: doc.tenantInfo?.numberOfOccupants ?? "",
    purposeOfRental:   doc.tenantInfo?.purposeOfRental ?? "",
    moveInDate:        doc.tenantInfo?.moveInDate ?? "",
    moveOutDate:       doc.tenantInfo?.moveOutDate ?? "",
    tenantId:          String(doc.tenantId),
    createdAt:         doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    visitFee:          doc.visitFee ?? 0,
    feeBreakdown: {
      platformFee: doc.feeBreakdown?.platformFee ?? 0,
      vat:         doc.feeBreakdown?.vat         ?? 0,
      stripeFee:   doc.feeBreakdown?.stripeFee   ?? 0,
      total:       doc.feeBreakdown?.total        ?? 0,
    },
    qrScannedAt: doc.qrScannedAt instanceof Date ? doc.qrScannedAt.toISOString() : (doc.qrScannedAt ? String(doc.qrScannedAt) : ""),
  };
}

// ─── scanQRCode ───────────────────────────────────────────────────────────────

// Set to true to enforce that QR can only be scanned on/after the scheduled visit date.
// Set to false to allow scanning at any time (useful during testing).
const ENFORCE_VISIT_DATE_WINDOW = false;

export async function scanQRCode(token: string): Promise<{ success: boolean }> {
  await dbConnect();

  const doc = await VisitRequest.findOne({ qrToken: token });
  if (!doc) throw new Error("Invalid QR token");
  if (doc.status !== "accepted") throw new Error("QR code already used or visit not accepted");

  if (ENFORCE_VISIT_DATE_WINDOW && doc.preferredDate) {
    // Parse the scheduled visit date (YYYY-MM-DD) as local midnight
    const [y, m, d] = (doc.preferredDate as string).split("-").map(Number);
    const visitDay   = new Date(y, m - 1, d);           // midnight of visit day
    const allowUntil = new Date(visitDay);
    allowUntil.setDate(allowUntil.getDate() + 2);        // allow up to +2 days after visit
    const now = new Date();

    if (now < visitDay) {
      throw new Error("QR code cannot be scanned before the scheduled visit date.");
    }
    if (now > allowUntil) {
      throw new Error("QR code has expired. The visit window has passed.");
    }
  }

  // Mark completed
  doc.status      = "completed";
  doc.qrScannedAt = new Date();
  await doc.save();

  const visitFee = doc.visitFee ?? 0;

  // ── Credit owner's pending balance (held for admin review before becoming available) ──
  // Set CREDIT_OWNER_WALLET = false to skip wallet credit (e.g. during early testing).
  const CREDIT_OWNER_WALLET = true;

  if (CREDIT_OWNER_WALLET && visitFee > 0) {
    // Fetch active platform fee rates from DB (never hardcode)
    const feeDoc = await PlatformFees.findOne({ isActive: true }).lean();
    const rates = feeDoc
      ? {
          platformFeeRate:  feeDoc.platformFeeRate,
          vatRate:          feeDoc.vatRate,
          stripeFeePercent: feeDoc.stripeFeePercent,
          stripeFeeFixed:   feeDoc.stripeFeeFixed,
        }
      : { platformFeeRate: 0, vatRate: 0, stripeFeePercent: 0, stripeFeeFixed: 0 };

    // Calculate fees to deduct from owner payout
    const breakdown   = calculateFees(visitFee, rates);
    const totalFees   = breakdown.platformFee + breakdown.vat + breakdown.stripeFee;
    const ownerPayout = Math.max(0, visitFee - totalFees);

    await Promise.all([
      // Upsert wallet — add ownerPayout to pendingBalance
      // Admin will manually move pendingBalance → availableBalance after review
      Wallet.findOneAndUpdate(
        { userId: doc.ownerId },
        { $inc: { pendingBalance: ownerPayout } },
        { upsert: true, new: true }
      ),

      // Update visit request escrow status + store the actual fee breakdown used
      VisitRequest.findByIdAndUpdate(doc._id, {
        "escrow.status":          "pending_release",
        "feeBreakdown.platformFee": breakdown.platformFee,
        "feeBreakdown.vat":         breakdown.vat,
        "feeBreakdown.stripeFee":   breakdown.stripeFee,
        "feeBreakdown.total":       totalFees,
      }),

      // Mark the escrow_hold transaction as completed
      Transaction.findOneAndUpdate(
        { referenceId: doc._id, referenceType: "visit_request", type: "escrow_hold" },
        { status: "completed" }
      ),

      // Record escrow release for owner (pending admin approval)
      Transaction.create({
        type:          "escrow_release",
        userId:        doc.ownerId,
        referenceId:   doc._id,
        referenceType: "visit_request",
        propertyId:    doc.propertyId,
        amount:        ownerPayout,
        stripeRef:     "",
        status:        "pending",  // becomes "completed" when admin releases to availableBalance
        description:   `Escrow pending release to owner for visit request ${doc._id}`,
      }),

      // Record platform fee earnings (platformFee + VAT + stripeFee)
      ...(totalFees > 0 ? [Transaction.create({
        type:          "platform_fee",
        userId:        null,  // platform earnings
        referenceId:   doc._id,
        referenceType: "visit_request",
        propertyId:    doc.propertyId,
        amount:        totalFees,
        stripeRef:     "",
        status:        "completed",
        description:   `Platform fee deducted from owner payout for visit request ${doc._id}`,
      })] : []),
    ]);
  }

  // Notify both parties — fire and forget (non-blocking)
  const prop = await Property.findById(doc.propertyId).select("propertyTitle").lean() as { propertyTitle?: string } | null;
  const propertyTitle = prop?.propertyTitle ?? "the property";

  void Promise.all([
    createNotification({
      userId:  String(doc.tenantId),
      type:    NotificationType.SHOWING_SCHEDULED,
      title:   "Visit Completed",
      message: `Your visit for ${propertyTitle} has been successfully completed.`,
      href:    "/dashboard/tenant/proposals",
    }),
    createNotification({
      userId:  String(doc.ownerId),
      type:    NotificationType.PAYMENT_RECEIVED,
      title:   "Visit Completed",
      message: `The visit for ${propertyTitle} has been completed. Your payout is pending release.`,
      href:    "/dashboard/owner/proposals",
    }),
  ]);

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

// ─── getShowingAgents ─────────────────────────────────────────────────────────

export interface ShowingAgentItem {
  id:               string;
  firstName:        string;
  lastName:         string;
  city:             string;
  stateProvince:    string;
  serviceType:      string;
  experienceLevel:  string;
  showingBasePrice: number;
  profileImage:     string;
}

export interface ShowingAgentsResult {
  agents:           ShowingAgentItem[];
  total:            number;
  totalPages:       number;
  locationOptions:  { value: string; label: string }[];
  priceRangeOptions: { value: string; label: string }[];
}

export async function getShowingAgents(params: {
  page:       number;
  search:     string;
  location:   string;
  priceRange: string;
  limit?:     number;
}): Promise<ShowingAgentsResult> {
  await requireSession();
  await dbConnect();

  const { page, search, location, priceRange, limit = 10 } = params;

  // ── Base query: showing_agent service providers ──
  const baseQuery: Record<string, unknown> = {
    role:        "service_provider",
    serviceType: "showing_agent",
  };

  if (search) {
    const rx = new RegExp(search, "i");
    baseQuery.$or = [{ firstName: rx }, { lastName: rx }];
  }

  if (location) {
    baseQuery.$or = [
      { city: new RegExp(location, "i") },
      { stateProvince: new RegExp(location, "i") },
    ];
  }

  if (priceRange) {
    const parts = priceRange.split("-");
    const min   = Number(parts[0]);
    const max   = parts[1] !== "" && parts[1] !== undefined ? Number(parts[1]) : NaN;
    if (!isNaN(min) && !isNaN(max)) {
      baseQuery.showingBasePrice = { $gte: min, $lte: max };
    } else if (!isNaN(min)) {
      baseQuery.showingBasePrice = { $gte: min };
    }
  }

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    User.find(baseQuery)
      .select("firstName lastName city stateProvince serviceType experienceLevel showingBasePrice profileImage")
      .sort({ showingBasePrice: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(baseQuery),
  ]);

  // ── Location options from DB ──
  const allCities = await User.distinct("city", {
    role:        "service_provider",
    serviceType: "showing_agent",
    city:        { $nin: [null, ""] },
  }) as string[];

  const locationOptions = allCities.sort().map((c) => ({ value: c, label: c }));

  // ── Price range options from DB min/max ──
  const priceAgg = await User.aggregate([
    { $match: { role: "service_provider", serviceType: "showing_agent", showingBasePrice: { $gt: 0 } } },
    { $group: { _id: null, min: { $min: "$showingBasePrice" }, max: { $max: "$showingBasePrice" } } },
  ]);

  // Static fallback brackets (used when DB has no price data or single price point)
  const STATIC_BRACKETS: { value: string; label: string }[] = [
    { value: "0-1000",    label: "฿0 – ฿1,000"   },
    { value: "1000-3000", label: "฿1,000 – ฿3,000" },
    { value: "3000-",     label: "฿3,000+"         },
  ];

  let priceRangeOptions: { value: string; label: string }[] = STATIC_BRACKETS;
  if (priceAgg.length > 0) {
    const { min, max } = priceAgg[0] as { min: number; max: number };
    const step = Math.ceil((max - min) / 3);
    if (step > 0) {
      const b1 = min + step;
      const b2 = min + step * 2;
      priceRangeOptions = [
        { value: `${min}-${b1}`,     label: `฿${min.toLocaleString()} – ฿${b1.toLocaleString()}`  },
        { value: `${b1}-${b2}`,      label: `฿${b1.toLocaleString()} – ฿${b2.toLocaleString()}`  },
        { value: `${b2}-${max + 1}`, label: `฿${b2.toLocaleString()}+`                            },
      ];
    }
  }

  const agents: ShowingAgentItem[] = docs.map((a) => ({
    id:               String(a._id),
    firstName:        a.firstName,
    lastName:         a.lastName,
    city:             (a.city as string) ?? "",
    stateProvince:    (a.stateProvince as string) ?? "",
    serviceType:      (a.serviceType as string) ?? "",
    experienceLevel:  (a.experienceLevel as string) ?? "",
    showingBasePrice: (a.showingBasePrice as number) ?? 0,
    profileImage:     (a.profileImage as string) ?? "",
  }));

  return { agents, total, totalPages: Math.ceil(total / limit), locationOptions, priceRangeOptions };
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

// ─── getQRScanDetails ─────────────────────────────────────────────────────────
// Public — no session required. Token is the authenticator.
// Only exposes what is needed for the confirmation screen.

export interface QRScanDetails {
  visitRequestId: string;
  status:         string;   // "accepted" | "completed" | "cancelled" etc.
  propertyTitle:  string;
  propertyAddress:string;
  propertyImage:  string;
  tenantName:     string;   // first name + last initial only (e.g. "John S.")
  preferredDate:  string;
  preferredTime:  string;
}

export async function getQRScanDetails(token: string): Promise<QRScanDetails | null> {
  await dbConnect();

  const doc = await VisitRequest.findOne({ qrToken: token }).lean();
  if (!doc) return null;

  const prop = await Property.findById(doc.propertyId)
    .select("propertyTitle address district province photos")
    .lean() as { propertyTitle?: string; address?: string; district?: string; province?: string; photos?: string[] } | null;

  const fullName  = doc.tenantInfo?.fullName ?? "";
  const parts     = fullName.trim().split(" ");
  const firstName = parts[0] ?? "";
  const lastInit  = parts.length > 1 ? `${parts[parts.length - 1].charAt(0)}.` : "";
  const tenantName = lastInit ? `${firstName} ${lastInit}` : firstName;

  return {
    visitRequestId:  String(doc._id),
    status:          doc.status ?? "",
    propertyTitle:   prop?.propertyTitle ?? "",
    propertyAddress: [prop?.address, prop?.district, prop?.province].filter(Boolean).join(", "),
    propertyImage:   prop?.photos?.[0] ?? "",
    tenantName,
    preferredDate:   doc.preferredDate ?? "",
    preferredTime:   doc.preferredTime ?? "",
  };
}

// ─── TenantVisitRequestDetail ─────────────────────────────────────────────────

export interface TenantVisitRequestDetail {
  id:                 string;
  status:             string;
  ownerAction:        string | null;
  qrToken:            string | null;
  // property
  propertyId:         string;
  propertyTitle:      string;
  propertyType:       string;
  propertyImages:     string[];
  propertyAddress:    string;
  rentPrice:          string;
  bedrooms:           number;
  bathrooms:          number;
  unitArea:           string;
  unitAreaUnit:       string;
  // visit schedule
  preferredDate:      string;
  preferredTime:      string;
  // showing person
  showingPersonName:  string;
  showingPersonImage: string;
  showingPersonTitle: string;
  isOwnerShowing:     boolean;
}

export async function getTenantVisitRequestDetail(id: string): Promise<TenantVisitRequestDetail> {
  const user = await requireSession();
  await dbConnect();

  const doc = await VisitRequest.findById(id).lean();
  if (!doc) throw new Error("Visit request not found");
  if (String(doc.tenantId) !== user.id) throw new Error("Forbidden");

  const prop = await Property.findById(doc.propertyId).lean() as (Record<string, unknown> & {
    propertyTitle?: string;
    propertyType?:  string;
    photos?:        string[];
    address?:       string;
    district?:      string;
    province?:      string;
    bedrooms?:      number;
    bathrooms?:     number;
    unitArea?:      string;
    unitAreaUnit?:  string;
    contracts?:     { months: number; rentPrice: string }[];
  }) | null;

  const rentPrice = prop?.contracts?.[0]?.rentPrice ?? "";
  const address   = [prop?.address, prop?.district, prop?.province].filter(Boolean).join(", ");

  const isOwnerShowing = !doc.ownerAction || doc.ownerAction === "show_self";
  const personId       = isOwnerShowing ? doc.ownerId : doc.assignedAgentId;

  type UserLean = { firstName?: string; lastName?: string; profileImage?: string; serviceType?: string };
  const person = personId
    ? await User.findById(personId).select("firstName lastName profileImage serviceType").lean() as UserLean | null
    : null;

  const showingPersonName  = person ? `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() : "";
  const showingPersonImage = (person?.profileImage as string) ?? "";
  const showingPersonTitle = isOwnerShowing ? "Property Owner" : ((person?.serviceType as string) ?? "Showing Agent");

  return {
    id:                 String(doc._id),
    status:             doc.status ?? "",
    ownerAction:        doc.ownerAction ?? null,
    qrToken:            (doc.status === "accepted" || doc.status === "completed") ? (doc.qrToken ?? null) : null,
    propertyId:         String(doc.propertyId),
    propertyTitle:      prop?.propertyTitle ?? "",
    propertyType:       prop?.propertyType  ?? "",
    propertyImages:     (prop?.photos       ?? []) as string[],
    propertyAddress:    address,
    rentPrice,
    bedrooms:           prop?.bedrooms    ?? 0,
    bathrooms:          prop?.bathrooms   ?? 0,
    unitArea:           prop?.unitArea    ?? "",
    unitAreaUnit:       prop?.unitAreaUnit ?? "sqm",
    preferredDate:      doc.preferredDate ?? "",
    preferredTime:      doc.preferredTime ?? "",
    showingPersonName,
    showingPersonImage,
    showingPersonTitle,
    isOwnerShowing,
  };
}
