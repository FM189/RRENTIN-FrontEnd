"use server";

import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RentBooking from "@/models/RentBooking";
import Property from "@/models/Property";
import User from "@/models/User";
import { getAccessToken } from "@/actions/cookie";
import { generateAgreementPdf } from "@/lib/agreementApi";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/types/notifications";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthenticated");
  return session.user;
}

function getClientIp(): string {
  // headers() returns a ReadonlyHeaders — best-effort IP extraction
  return "server";
}

// ─── signAgreementAsOwner ─────────────────────────────────────────────────────

export interface OwnerAgreementInput {
  bookingId:     string;
  ownerAddress:  string;
  includedItems: string;
  signatureData: string;  // base64 PNG data URL
}

export async function signAgreementAsOwner(
  input: OwnerAgreementInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireSession();
    await dbConnect();

    if (!Types.ObjectId.isValid(input.bookingId)) {
      return { success: false, error: "Invalid booking." };
    }

    const booking = await RentBooking.findById(input.bookingId)
      .populate("propertyId", "propertyTitle address")
      .populate("tenantId",   "firstName lastName nationality")
      .lean();

    if (!booking) return { success: false, error: "Booking not found." };
    if (String(booking.ownerId) !== user.id) return { success: false, error: "Forbidden." };
    if (booking.status !== "pending") return { success: false, error: "Booking is no longer pending." };

    const ownerDoc = await User.findById(user.id).select("firstName lastName phone").lean() as {
      firstName?: string; lastName?: string; phone?: string;
    } | null;

    const prop   = booking.propertyId as unknown as { propertyTitle?: string; address?: string } | null;
    const tenant = booking.tenantId   as unknown as { _id: Types.ObjectId; firstName?: string; lastName?: string; nationality?: string } | null;
    // tenantId is populated — extract the real ObjectId from the populated document
    const tenantUserId = String(tenant?._id ?? booking.tenantId);

    const token = await getAccessToken();
    if (!token) return { success: false, error: "Authentication error." };

    const signedAt = new Date().toISOString();
    const moveInDate = booking.moveInDate;
    const paymentDueDay = moveInDate ? new Date(moveInDate).getDate() : 1;

    // Generate PDF with owner signature only (tenant block left blank)
    const pdfUrl = await generateAgreementPdf(
      {
        bookingId:            input.bookingId,
        ownerName:            `${ownerDoc?.firstName ?? ""} ${ownerDoc?.lastName ?? ""}`.trim(),
        ownerAddress:         input.ownerAddress,
        ownerPhone:           ownerDoc?.phone ?? "",
        ownerSignature:       input.signatureData,
        ownerSignedAt:        signedAt,
        tenantName:           `${tenant?.firstName ?? ""} ${tenant?.lastName ?? ""}`.trim() || booking.tenantInfo?.fullName,
        tenantNationality:    tenant?.nationality ?? booking.tenantInfo?.nationality ?? "",
        tenantCurrentCountry: booking.tenantInfo?.currentCountry ?? "",
        propertyTitle:        prop?.propertyTitle ?? "",
        propertyAddress:      prop?.address ?? "",
        rentalAmount:         booking.rentalAmount,
        securityDeposit:      booking.securityDeposit,
        contractMonths:       booking.contractMonths,
        stayDays:             booking.stayDays,
        dailyRate:            booking.dailyRate,
        moveInDate:           booking.moveInDate,
        moveOutDate:          booking.moveOutDate,
        paymentDueDay,
        customFees:           (booking.customFeesSnapshot ?? []) as { name: string; amount: number }[],
        includedItems:        input.includedItems,
      },
      token,
    );

    await RentBooking.findByIdAndUpdate(input.bookingId, {
      status:                          "accepted",
      "agreement.pdfUrl":              pdfUrl,
      "agreement.ownerSignedAt":       new Date(signedAt),
      "agreement.ownerAddress":        input.ownerAddress,
      "agreement.includedItems":       input.includedItems,
      "agreement.ownerSignatureData":  input.signatureData,
    });

    // Notify tenant
    await createNotification({
      userId:  tenantUserId,
      type:    NotificationType.RENT_BOOKING_ACCEPTED,
      title:   "Booking Accepted",
      message: `Your rental booking for ${prop?.propertyTitle ?? "the property"} has been accepted. Please review and sign the agreement.`,
      href:    "/dashboard/tenant/proposals",
    });

    return { success: true };
  } catch (err) {
    console.error("[signAgreementAsOwner]", err);
    return { success: false, error: "Something went wrong." };
  }
}

// ─── previewAgreementForOwner ─────────────────────────────────────────────────

export async function previewAgreementForOwner(
  input: Omit<OwnerAgreementInput, "signatureData">,
): Promise<{ success: boolean; pdfUrl?: string; error?: string }> {
  try {
    const user = await requireSession();
    await dbConnect();

    if (!Types.ObjectId.isValid(input.bookingId)) {
      return { success: false, error: "Invalid booking." };
    }

    const booking = await RentBooking.findById(input.bookingId)
      .populate("propertyId", "propertyTitle address")
      .populate("tenantId",   "firstName lastName nationality")
      .lean();

    if (!booking) return { success: false, error: "Booking not found." };
    if (String(booking.ownerId) !== user.id) return { success: false, error: "Forbidden." };

    const ownerDoc = await User.findById(user.id).select("firstName lastName phone").lean() as {
      firstName?: string; lastName?: string; phone?: string;
    } | null;

    const prop   = booking.propertyId as unknown as { propertyTitle?: string; address?: string } | null;
    const tenant = booking.tenantId   as unknown as { firstName?: string; lastName?: string; nationality?: string } | null;

    const token = await getAccessToken();
    if (!token) return { success: false, error: "Authentication error." };

    const moveInDate    = booking.moveInDate;
    const paymentDueDay = moveInDate ? new Date(moveInDate).getDate() : 1;

    const pdfUrl = await generateAgreementPdf(
      {
        bookingId:            input.bookingId,
        ownerName:            `${ownerDoc?.firstName ?? ""} ${ownerDoc?.lastName ?? ""}`.trim(),
        ownerAddress:         input.ownerAddress,
        ownerPhone:           ownerDoc?.phone ?? "",
        ownerSignature:       "",   // no signature — preview only
        ownerSignedAt:        "",
        tenantName:           `${tenant?.firstName ?? ""} ${tenant?.lastName ?? ""}`.trim() || booking.tenantInfo?.fullName,
        tenantNationality:    tenant?.nationality ?? booking.tenantInfo?.nationality ?? "",
        tenantCurrentCountry: booking.tenantInfo?.currentCountry ?? "",
        propertyTitle:        prop?.propertyTitle ?? "",
        propertyAddress:      prop?.address ?? "",
        rentalAmount:         booking.rentalAmount,
        securityDeposit:      booking.securityDeposit,
        contractMonths:       booking.contractMonths,
        stayDays:             booking.stayDays,
        dailyRate:            booking.dailyRate,
        moveInDate:           booking.moveInDate,
        moveOutDate:          booking.moveOutDate,
        paymentDueDay,
        customFees:           (booking.customFeesSnapshot ?? []) as { name: string; amount: number }[],
        includedItems:        input.includedItems,
        preview:              true,
      },
      token,
    );

    return { success: true, pdfUrl };
  } catch (err) {
    console.error("[previewAgreementForOwner]", err);
    return { success: false, error: "Something went wrong." };
  }
}

// ─── signAgreementAsTenant ────────────────────────────────────────────────────

export async function signAgreementAsTenant(
  bookingId:     string,
  signatureData: string,  // base64 PNG data URL
): Promise<{ success: boolean; pdfUrl?: string; error?: string }> {
  try {
    const user = await requireSession();
    await dbConnect();

    if (!Types.ObjectId.isValid(bookingId)) {
      return { success: false, error: "Invalid booking." };
    }

    const booking = await RentBooking.findById(bookingId)
      .populate("propertyId", "propertyTitle address")
      .lean();

    if (!booking) return { success: false, error: "Booking not found." };
    if (String(booking.tenantId) !== user.id) return { success: false, error: "Forbidden." };
    if (booking.status !== "accepted") return { success: false, error: "Booking must be accepted before signing." };
    if (!booking.agreement?.ownerSignedAt) return { success: false, error: "Owner has not signed the agreement yet." };

    const ownerDoc = await User.findById(booking.ownerId).select("firstName lastName phone").lean() as {
      firstName?: string; lastName?: string; phone?: string;
    } | null;

    const prop = booking.propertyId as unknown as { propertyTitle?: string; address?: string } | null;

    const token = await getAccessToken();
    if (!token) return { success: false, error: "Authentication error." };

    const signedAt = new Date().toISOString();
    const moveInDate = booking.moveInDate;
    const paymentDueDay = moveInDate ? new Date(moveInDate).getDate() : 1;

    // Regenerate final PDF with both signatures
    const pdfUrl = await generateAgreementPdf(
      {
        bookingId,
        ownerName:            `${ownerDoc?.firstName ?? ""} ${ownerDoc?.lastName ?? ""}`.trim(),
        ownerAddress:         booking.agreement?.ownerAddress ?? "",
        ownerPhone:           ownerDoc?.phone ?? "",
        ownerSignature:       booking.agreement?.ownerSignatureData ?? "",
        ownerSignedAt:        booking.agreement?.ownerSignedAt?.toISOString() ?? "",
        tenantName:           booking.tenantInfo?.fullName ?? "",
        tenantNationality:    booking.tenantInfo?.nationality ?? "",
        tenantCurrentCountry: booking.tenantInfo?.currentCountry ?? "",
        tenantSignature:      signatureData,
        tenantSignedAt:       signedAt,
        propertyTitle:        prop?.propertyTitle ?? "",
        propertyAddress:      prop?.address ?? "",
        rentalAmount:         booking.rentalAmount,
        securityDeposit:      booking.securityDeposit,
        contractMonths:       booking.contractMonths,
        stayDays:             booking.stayDays,
        dailyRate:            booking.dailyRate,
        moveInDate:           booking.moveInDate,
        moveOutDate:          booking.moveOutDate,
        paymentDueDay,
        customFees:           (booking.customFeesSnapshot ?? []) as { name: string; amount: number }[],
        includedItems:        booking.agreement?.includedItems ?? "",
      },
      token,
    );

    await RentBooking.findByIdAndUpdate(bookingId, {
      "agreement.pdfUrl":               pdfUrl,
      "agreement.tenantSignedAt":        new Date(signedAt),
      "agreement.tenantSignatureData":   signatureData,
    });

    return { success: true, pdfUrl };
  } catch (err) {
    console.error("[signAgreementAsTenant]", err);
    return { success: false, error: "Something went wrong." };
  }
}
