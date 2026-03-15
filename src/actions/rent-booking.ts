"use server";

import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RentBooking from "@/models/RentBooking";
import Property from "@/models/Property";
import PlatformFees from "@/models/PlatformFees";
import Transaction from "@/models/Transaction";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/types/notifications";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthenticated");
  return session.user;
}

function parsePriceNum(val: string | number): number {
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateRentBookingInput {
  propertyId:      string;
  // Personal info
  fullName:        string;
  currentCountry:  string;
  nationality:     string;
  occupation:      string;
  designation:     string;
  // Stay details
  moveInDate:      string;
  moveOutDate:     string;
  arrivalTime:     string;
  stayDays:        number;
  // Preferences
  guestsStaying:   string;
  primaryReason:   string;
  visaType:        string;
  specialRequests: string;
  // Contract (matched on client, validated server-side)
  contractMonths:  number;
}

export interface CreateRentBookingResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export interface RentBookingSummary {
  id:              string;
  propertyId:      string;
  propertyTitle:   string;
  propertyImage:   string;
  partyName:       string;   // tenant name for owner view; owner name for tenant view
  moveInDate:      string;
  moveOutDate:     string;
  stayDays:        number;
  contractMonths:  number;
  rentalAmount:    number;
  securityDeposit: number;
  totalUpfront:    number;
  status:          string;
  ownerNote:       string;
  createdAt:       string;
}

// ─── createRentBooking ────────────────────────────────────────────────────────

export async function createRentBooking(
  input: CreateRentBookingInput
): Promise<CreateRentBookingResult> {
  try {
    const user = await requireSession();
    await dbConnect();

    // ── Validate property exists and is approved ──
    if (!Types.ObjectId.isValid(input.propertyId)) {
      return { success: false, error: "Invalid property." };
    }

    const property = await Property.findOne({
      _id:            new Types.ObjectId(input.propertyId),
      approvalStatus: "approved",
      propertyStatus: "available",
    }).lean() as {
      _id: Types.ObjectId;
      owner: Types.ObjectId;
      propertyTitle?: string;
      contracts?: { months: number; rentPrice: string; securityDeposit: string }[];
      customFees?:  { name: string; amount: number }[];
    } | null;

    if (!property) {
      return { success: false, error: "Property not found or not available." };
    }

    // ── Prevent duplicate active bookings ──
    const duplicate = await RentBooking.exists({
      tenantId:   user.id,
      propertyId: input.propertyId,
      status:     { $nin: ["rejected", "cancelled", "completed"] },
    });

    if (duplicate) {
      return { success: false, error: "You already have an active booking request for this property." };
    }

    // ── Validate dates ──
    if (!input.moveInDate || !input.moveOutDate) {
      return { success: false, error: "Move-in and move-out dates are required." };
    }
    if (input.moveOutDate <= input.moveInDate) {
      return { success: false, error: "Move-out date must be after move-in date." };
    }
    if (input.stayDays < 1) {
      return { success: false, error: "Stay duration must be at least 1 day." };
    }

    // ── Validate & resolve contract server-side ──
    const contracts = (property.contracts ?? []).sort((a, b) => a.months - b.months);
    if (!contracts.length) {
      return { success: false, error: "This property has no available contracts." };
    }

    const estimatedMonths = Math.max(1, Math.round(input.stayDays / 30));
    const contractIdx     = contracts.findIndex((c) => c.months >= estimatedMonths);
    const contract        = contractIdx === -1
      ? contracts[contracts.length - 1]
      : contracts[contractIdx];

    const rentalAmount    = parsePriceNum(contract.rentPrice);
    const securityDeposit = parsePriceNum(contract.securityDeposit);
    const dailyRate       = parseFloat((rentalAmount / 30).toFixed(2));
    const fullMonths      = Math.floor(input.stayDays / 30);
    const remainderDays   = input.stayDays % 30;
    const billingCycles   = fullMonths + (remainderDays > 0 ? 1 : 0);

    // Verify client-sent contractMonths matches server-computed billing cycles
    if (billingCycles !== input.contractMonths) {
      return { success: false, error: "Contract mismatch. Please refresh and try again." };
    }

    // ── Fetch and snapshot platform fees ──
    const pf = await PlatformFees.findOne({ isActive: true }).lean();

    const tenantFeeEnabled = pf?.tenantContractFeeEnabled ?? true;
    const tenantFeeRate    = pf?.tenantContractFeeRate    ?? 0.05;
    const ownerFeeEnabled  = pf?.ownerContractFeeEnabled  ?? true;
    const ownerFeeRate     = pf?.ownerContractFeeRate     ?? 0.05;
    const vatRate          = pf?.vatRate                  ?? 0.07;
    const platformFeeRate  = pf?.platformFeeRate          ?? 0.09;
    const stripeFeePercent = pf?.stripeFeePercent         ?? 0.034;
    const stripeFeeFixed   = pf?.stripeFeeFixed           ?? 10;
    const lateFeeRate      = pf?.lateFeeRate              ?? 0.15;

    const totalContractValue  = (fullMonths * rentalAmount) + (remainderDays * dailyRate);
    const tenantContractFee   = tenantFeeEnabled ? Math.round(tenantFeeRate * totalContractValue) : 0;
    const tenantContractFeeVat = tenantFeeEnabled ? Math.round(vatRate * tenantContractFee) : 0;
    const ownerContractFee    = ownerFeeEnabled  ? Math.round(ownerFeeRate  * totalContractValue) : 0;
    const ownerContractFeeVat = ownerContractFee > 0 ? Math.round(vatRate * ownerContractFee) : 0;

    // ── Custom property fees (internet, parking, etc.) ──
    const customFeesSnapshot = (property.customFees ?? []).filter((f) => f.name && f.amount > 0);
    const monthlyFees        = customFeesSnapshot.reduce((sum, f) => sum + f.amount, 0);

    const tenantTotalCharged = rentalAmount + monthlyFees + tenantContractFee + tenantContractFeeVat;
    const totalUpfront = tenantTotalCharged; // first month + monthly fees + contract fee + VAT; deposit not charged

    // ── Save booking ──
    const booking = await RentBooking.create({
      tenantId:   new Types.ObjectId(user.id),
      ownerId:    property.owner,
      propertyId: new Types.ObjectId(input.propertyId),

      tenantInfo: {
        fullName:       input.fullName.trim(),
        currentCountry: input.currentCountry.trim(),
        nationality:    input.nationality.trim(),
        occupation:     input.occupation.trim(),
        designation:    input.designation.trim(),
      },

      moveInDate:  input.moveInDate,
      moveOutDate: input.moveOutDate,
      arrivalTime: input.arrivalTime,
      stayDays:    input.stayDays,

      guestsStaying:   input.guestsStaying,
      primaryReason:   input.primaryReason,
      visaType:        input.visaType,
      specialRequests: input.specialRequests?.trim() ?? "",

      contractMonths:     billingCycles,
      rentalAmount,
      securityDeposit,
      totalUpfront,
      dailyRate,
      remainderDays,
      customFeesSnapshot,
      monthlyFees,

      fees: {
        tenantContractFeeEnabled: tenantFeeEnabled,
        tenantContractFeeRate:    tenantFeeRate,
        tenantContractFee,
        tenantContractFeeVat,
        tenantTotalCharged,
        ownerContractFeeEnabled:  ownerFeeEnabled,
        ownerContractFeeRate:     ownerFeeRate,
        ownerContractFee,
        ownerContractFeeVat,
        platformFeeRate,
        vatRate,
        stripeFeePercent,
        stripeFeeFixed,
        lateFeeRate,
      },

      status: "pending",
    });

    const propertyTitle = String(property.propertyTitle ?? "your property");

    // ── Notify owner ──
    void createNotification({
      userId:  String(property.owner),
      type:    NotificationType.RENT_BOOKING_RECEIVED,
      title:   "New Rent Booking Request",
      message: `${input.fullName} has submitted a rent booking request for ${propertyTitle}.`,
      href:    `/dashboard/owner/proposals`,
    });

    return { success: true, bookingId: String(booking._id) };
  } catch (err) {
    console.error("[createRentBooking]", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ─── getTenantRentBookings ────────────────────────────────────────────────────

export async function getTenantRentBookings(
  page = 1,
  statusFilter?: string,
): Promise<{ bookings: RentBookingSummary[]; total: number; totalPages: number }> {
  const user = await requireSession();
  await dbConnect();

  const query: Record<string, unknown> = { tenantId: user.id };
  if (statusFilter && statusFilter !== "all") query.status = statusFilter;

  const limit = 10;
  const skip  = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    RentBooking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("propertyId", "propertyTitle photos")
      .populate("ownerId", "firstName lastName")
      .lean(),
    RentBooking.countDocuments(query),
  ]);

  const bookings: RentBookingSummary[] = docs.map((d) => {
    const prop  = d.propertyId as unknown as { _id?: unknown; propertyTitle?: string; photos?: string[] } | null;
    const owner = d.ownerId    as unknown as { firstName?: string; lastName?: string } | null;
    const partyName = owner ? `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() : "";
    return {
      id:              String(d._id),
      propertyId:      String(prop?._id ?? d.propertyId),
      propertyTitle:   prop?.propertyTitle ?? "",
      propertyImage:   prop?.photos?.[0]   ?? "",
      partyName,
      moveInDate:      d.moveInDate,
      moveOutDate:     d.moveOutDate,
      stayDays:        d.stayDays,
      contractMonths:  d.contractMonths,
      rentalAmount:    d.rentalAmount,
      securityDeposit: d.securityDeposit,
      totalUpfront:    d.totalUpfront,
      status:          d.status,
      ownerNote:       d.ownerNote ?? "",
      createdAt:       d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
    };
  });

  return { bookings, total, totalPages: Math.ceil(total / limit) };
}

// ─── getOwnerRentBookings ─────────────────────────────────────────────────────

export async function getOwnerRentBookings(
  page = 1,
  statusFilter?: string,
): Promise<{ bookings: RentBookingSummary[]; total: number; totalPages: number }> {
  const user = await requireSession();
  await dbConnect();

  const query: Record<string, unknown> = { ownerId: user.id };
  if (statusFilter && statusFilter !== "all") query.status = statusFilter;

  const limit = 10;
  const skip  = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    RentBooking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("propertyId", "propertyTitle photos")
      .lean(),
    RentBooking.countDocuments(query),
  ]);

  const bookings: RentBookingSummary[] = docs.map((d) => {
    const prop = d.propertyId as unknown as { _id?: unknown; propertyTitle?: string; photos?: string[] } | null;
    return {
      id:              String(d._id),
      propertyId:      String(prop?._id ?? d.propertyId),
      propertyTitle:   prop?.propertyTitle ?? "",
      propertyImage:   prop?.photos?.[0]   ?? "",
      partyName:       d.tenantInfo?.fullName ?? "",
      moveInDate:      d.moveInDate,
      moveOutDate:     d.moveOutDate,
      stayDays:        d.stayDays,
      contractMonths:  d.contractMonths,
      rentalAmount:    d.rentalAmount,
      securityDeposit: d.securityDeposit,
      totalUpfront:    d.totalUpfront,
      status:          d.status,
      ownerNote:       d.ownerNote ?? "",
      createdAt:       d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
    };
  });

  return { bookings, total, totalPages: Math.ceil(total / limit) };
}

// ─── getRentBookingDetail ─────────────────────────────────────────────────────

export interface RentBookingDetail {
  id:              string;
  ownerId:         string;
  tenantId:        string;
  propertyId:      string;
  propertyTitle:   string;
  propertyImages:  string[];
  propertyType:    string;
  propertyAddress: string;
  bedrooms:        number;
  bathrooms:       number;
  unitArea:        string;
  unitAreaUnit:    string;
  tenantInfo: {
    fullName:       string;
    currentCountry: string;
    nationality:    string;
    occupation:     string;
    designation:    string;
  };
  agreement: {
    pdfUrl:         string;
    ownerSignedAt:  string | null;
    tenantSignedAt: string | null;
    ownerAddress:   string;
    internetCharge: number;
    parkingFee:     number;
    includedItems:  string;
  };
  moveInDate:      string;
  moveOutDate:     string;
  arrivalTime:     string;
  stayDays:        number;
  guestsStaying:   string;
  primaryReason:   string;
  visaType:        string;
  specialRequests: string;
  contractMonths:     number;
  rentalAmount:       number;
  securityDeposit:    number;
  totalUpfront:       number;
  dailyRate:          number;
  remainderDays:      number;
  customFeesSnapshot: { name: string; amount: number }[];
  monthlyFees:        number;
  fees: {
    tenantContractFeeEnabled: boolean;
    tenantContractFeeRate:    number;
    tenantContractFee:        number;
    tenantContractFeeVat:     number;
    tenantTotalCharged:       number;
    ownerContractFeeEnabled:  boolean;
    ownerContractFeeRate:     number;
    ownerContractFee:         number;
    ownerContractFeeVat:      number;
    platformFeeRate:          number;
    vatRate:                  number;
    stripeFeePercent:         number;
    stripeFeeFixed:           number;
    lateFeeRate:              number;
  };
  status:          string;
  ownerNote:       string;
  createdAt:       string;
  // Overdue / recurring state
  overdueAmount:    number;
  overdueMonths:    number;
  isRestricted:     boolean;
  lateFeePendingAt: string | null;
  rentMonthsPaid:   number;
  nextRentDueDate:  string | null;
}

export async function getRentBookingDetail(id: string): Promise<RentBookingDetail | null> {
  const user = await requireSession();
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) return null;

  const doc = await RentBooking.findById(id)
    .populate("propertyId", "propertyTitle photos propertyType address bedrooms bathrooms unitArea unitAreaUnit")
    .lean();

  if (!doc) return null;
  if (String(doc.ownerId) !== user.id && String(doc.tenantId) !== user.id) return null;

  const prop = doc.propertyId as unknown as {
    _id?: unknown; propertyTitle?: string; photos?: string[];
    propertyType?: string; address?: string;
    bedrooms?: number; bathrooms?: number; unitArea?: string; unitAreaUnit?: string;
  } | null;

  return {
    id:              String(doc._id),
    ownerId:         String(doc.ownerId),
    tenantId:        String(doc.tenantId),
    propertyId:      String(prop?._id ?? doc.propertyId),
    propertyTitle:   prop?.propertyTitle ?? "",
    propertyImages:  prop?.photos        ?? [],
    propertyType:    prop?.propertyType  ?? "",
    propertyAddress: prop?.address       ?? "",
    bedrooms:        prop?.bedrooms      ?? 0,
    bathrooms:       prop?.bathrooms     ?? 0,
    unitArea:        prop?.unitArea      ?? "",
    unitAreaUnit:    prop?.unitAreaUnit   ?? "sqm",
    tenantInfo: {
      fullName:       doc.tenantInfo.fullName,
      currentCountry: doc.tenantInfo.currentCountry,
      nationality:    doc.tenantInfo.nationality,
      occupation:     doc.tenantInfo.occupation,
      designation:    doc.tenantInfo.designation,
    },
    agreement: {
      pdfUrl:         doc.agreement?.pdfUrl        ?? "",
      ownerSignedAt:  doc.agreement?.ownerSignedAt  ? new Date(doc.agreement.ownerSignedAt).toISOString()  : null,
      tenantSignedAt: doc.agreement?.tenantSignedAt ? new Date(doc.agreement.tenantSignedAt).toISOString() : null,
      ownerAddress:   doc.agreement?.ownerAddress   ?? "",
      internetCharge: doc.agreement?.internetCharge ?? 0,
      parkingFee:     doc.agreement?.parkingFee     ?? 0,
      includedItems:  doc.agreement?.includedItems  ?? "",
    },
    moveInDate:      doc.moveInDate,
    moveOutDate:     doc.moveOutDate,
    arrivalTime:     doc.arrivalTime,
    stayDays:        doc.stayDays,
    guestsStaying:   doc.guestsStaying,
    primaryReason:   doc.primaryReason,
    visaType:        doc.visaType,
    specialRequests: doc.specialRequests,
    contractMonths:  doc.contractMonths,
    rentalAmount:    doc.rentalAmount,
    securityDeposit: doc.securityDeposit,
    totalUpfront:    doc.totalUpfront,
    dailyRate:          doc.dailyRate,
    remainderDays:      doc.remainderDays,
    customFeesSnapshot: (doc.customFeesSnapshot ?? []).map((f) => ({ name: String(f.name), amount: Number(f.amount) })),
    monthlyFees:        doc.monthlyFees ?? 0,
    fees: {
      tenantContractFeeEnabled: doc.fees?.tenantContractFeeEnabled ?? true,
      tenantContractFeeRate:    doc.fees?.tenantContractFeeRate    ?? 0.05,
      tenantContractFee:        doc.fees?.tenantContractFee        ?? 0,
      tenantContractFeeVat:     doc.fees?.tenantContractFeeVat     ?? 0,
      tenantTotalCharged:       doc.fees?.tenantTotalCharged       ?? doc.rentalAmount,
      ownerContractFeeEnabled:  doc.fees?.ownerContractFeeEnabled  ?? true,
      ownerContractFeeRate:     doc.fees?.ownerContractFeeRate     ?? 0.05,
      ownerContractFee:         doc.fees?.ownerContractFee         ?? 0,
      ownerContractFeeVat:      doc.fees?.ownerContractFeeVat      ?? 0,
      platformFeeRate:          doc.fees?.platformFeeRate          ?? 0.09,
      vatRate:                  doc.fees?.vatRate                  ?? 0.07,
      stripeFeePercent:         doc.fees?.stripeFeePercent         ?? 0.034,
      stripeFeeFixed:           doc.fees?.stripeFeeFixed           ?? 10,
      lateFeeRate:              doc.fees?.lateFeeRate              ?? 0.15,
    },
    status:          doc.status,
    ownerNote:       doc.ownerNote ?? "",
    createdAt:       doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    overdueAmount:    doc.overdueAmount   ?? 0,
    overdueMonths:    doc.overdueMonths   ?? 0,
    isRestricted:     doc.isRestricted    ?? false,
    lateFeePendingAt: doc.lateFeePendingAt ? new Date(doc.lateFeePendingAt).toISOString() : null,
    rentMonthsPaid:   doc.rentMonthsPaid  ?? 0,
    nextRentDueDate:  doc.nextRentDueDate ? new Date(doc.nextRentDueDate).toISOString() : null,
  };
}

// ─── ownerDecideRentBooking ───────────────────────────────────────────────────

export async function ownerDecideRentBooking(
  id:       string,
  decision: "accepted" | "rejected",
  note?:    string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireSession();
    await dbConnect();

    const doc = await RentBooking.findById(id);
    if (!doc) return { success: false, error: "Booking not found." };
    if (String(doc.ownerId) !== user.id) return { success: false, error: "Forbidden." };
    if (doc.status !== "pending") return { success: false, error: "Booking is no longer pending." };

    await RentBooking.findByIdAndUpdate(id, {
      status:    decision,
      ownerNote: note?.trim() ?? "",
    });

    const prop = await Property.findById(doc.propertyId).select("propertyTitle").lean() as { propertyTitle?: string } | null;
    const propertyTitle = prop?.propertyTitle ?? "the property";

    if (decision === "accepted") {
      void createNotification({
        userId:  String(doc.tenantId),
        type:    NotificationType.RENT_BOOKING_ACCEPTED,
        title:   "Booking Request Accepted",
        message: `Your rent booking for ${propertyTitle} has been accepted. Please proceed with the upfront payment.`,
        href:    `/dashboard/tenant/proposals`,
      });
    } else {
      void createNotification({
        userId:  String(doc.tenantId),
        type:    NotificationType.RENT_BOOKING_REJECTED,
        title:   "Booking Request Rejected",
        message: `Your rent booking for ${propertyTitle} was not approved.${note ? ` Reason: ${note}` : ""}`,
        href:    `/dashboard/tenant/proposals`,
      });
    }

    return { success: true };
  } catch (err) {
    console.error("[ownerDecideRentBooking]", err);
    return { success: false, error: "Something went wrong." };
  }
}

// ─── cancelRentBooking ────────────────────────────────────────────────────────

export async function cancelRentBooking(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireSession();
    await dbConnect();

    const doc = await RentBooking.findById(id);
    if (!doc) return { success: false, error: "Booking not found." };
    if (String(doc.tenantId) !== user.id) return { success: false, error: "Forbidden." };
    if (doc.status !== "pending") return { success: false, error: "Booking can only be cancelled while pending." };

    await RentBooking.findByIdAndUpdate(id, { status: "cancelled" });

    const prop = await Property.findById(doc.propertyId).select("propertyTitle").lean() as { propertyTitle?: string } | null;
    const propertyTitle = prop?.propertyTitle ?? "the property";

    void createNotification({
      userId:  String(doc.ownerId),
      type:    NotificationType.RENT_BOOKING_RECEIVED,
      title:   "Booking Request Cancelled",
      message: `The tenant has cancelled their rent booking request for ${propertyTitle}.`,
      href:    `/dashboard/owner/proposals`,
    });

    return { success: true };
  } catch (err) {
    console.error("[cancelRentBooking]", err);
    return { success: false, error: "Something went wrong." };
  }
}

// ─── getRentPaymentHistory ────────────────────────────────────────────────────

export interface RentPaymentEntry {
  id:           string;
  type:         string;
  description:  string;
  amount:       number;
  date:         string;
  status:       string;
  stripeRef:    string;
  isDeduction?: boolean; // owner view: true for deduction lines (not owner_payout)
}

export async function getRentPaymentHistory(
  bookingId: string,
  role:       "tenant" | "owner",
): Promise<RentPaymentEntry[]> {
  const user = await requireSession();
  await dbConnect();

  if (!Types.ObjectId.isValid(bookingId)) return [];

  // Verify caller is part of this booking
  const booking = await RentBooking.findById(bookingId).lean();
  if (!booking) return [];
  if (String(booking.tenantId) !== user.id && String(booking.ownerId) !== user.id) return [];

  const tenantId = String(booking.tenantId);
  const ownerId  = String(booking.ownerId);

  // For tenant: rent_payment + monthly_fee + contract_fee + vat (userId=tenant) + late_fee
  // For owner:  owner_payout + all deduction types so the owner can see a full breakdown
  const txs = await Transaction.find(
    role === "tenant"
      ? {
          referenceId:   new Types.ObjectId(bookingId),
          referenceType: "rent_booking",
          status:        "completed",
          $or: [
            { type: { $in: ["rent_payment", "monthly_fee", "contract_fee", "vat"] }, userId: new Types.ObjectId(tenantId) },
            { type: "late_fee" },
          ],
        }
      : {
          referenceId:   new Types.ObjectId(bookingId),
          referenceType: "rent_booking",
          status:        "completed",
          $or: [
            { type: "owner_payout", userId: new Types.ObjectId(ownerId) },
            { type: "platform_fee", userId: null },
            { type: "vat",          userId: null },                          // VAT on platform fee
            { type: "stripe_fee",   userId: null },
            { type: "contract_fee", userId: new Types.ObjectId(ownerId) },   // owner contract fee deducted
            { type: "vat",          userId: new Types.ObjectId(ownerId) },   // VAT on owner contract fee
          ],
        }
  )
    .sort({ createdAt: 1 })
    .lean();

  return txs.map((tx) => ({
    id:          String(tx._id),
    type:        tx.type,
    // Strip "— booking XXXX" suffix that's appended in the webhook handler
    description: tx.description.replace(/\s*—\s*booking\s+\S+$/i, "").trim(),
    amount:      tx.amount,
    date:        tx.createdAt instanceof Date ? tx.createdAt.toISOString() : String(tx.createdAt),
    status:      tx.status,
    stripeRef:   tx.stripeRef,
    isDeduction: role === "owner" && tx.type !== "owner_payout",
  }));
}