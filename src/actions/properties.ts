"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { Types } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PropertyStats {
  total: number;
  available: number;
  rented: number;
  pending: number; // pending admin approval
}

// ─── Types for property list ─────────────────────────────────────────────────

export interface PropertyListItem {
  id: string;
  title: string;
  type: string;
  address: string;
  price: string;
  image: string;
  propertyStatus: "available" | "rented" | "unavailable";
  approvalStatus: "pending" | "approved" | "rejected";
}

export interface PropertiesResult {
  properties: PropertyListItem[];
  total: number;
  totalPages: number;
  page: number;
}

const PROPERTIES_PER_PAGE = 8;

// ─── Get paginated + filtered properties for the owner ────────────────────────

export async function getOwnerProperties({
  page = 1,
  search = "",
  status = "",
  type = "",
}: {
  page?: number;
  search?: string;
  status?: string;
  type?: string;
}): Promise<PropertiesResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { properties: [], total: 0, totalPages: 0, page: 1 };
  }

  await dbConnect();

  const ownerId = new Types.ObjectId(session.user.id);
  const match: Record<string, unknown> = { owner: ownerId };

  if (search.trim()) {
    match.$or = [
      { propertyTitle: { $regex: search.trim(), $options: "i" } },
      { address: { $regex: search.trim(), $options: "i" } },
      { projectName: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (status) match.propertyStatus = status;
  if (type) match.propertyType = { $regex: `^${type}$`, $options: "i" };

  const limit = PROPERTIES_PER_PAGE;
  const skip = (page - 1) * limit;

  const [total, docs] = await Promise.all([
    Property.countDocuments(match),
    Property.find(match)
      .select("propertyTitle propertyType address propertyPrice photos propertyStatus approvalStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const properties: PropertyListItem[] = docs.map((doc) => ({
    id: String(doc._id),
    title: doc.propertyTitle,
    type: doc.propertyType,
    address: doc.address,
    price: doc.propertyPrice,
    image: doc.photos?.[0] ?? "",
    propertyStatus: doc.propertyStatus as "available" | "rented" | "unavailable",
    approvalStatus: doc.approvalStatus as "pending" | "approved" | "rejected",
  }));

  return {
    properties,
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

// ─── Types for map view ───────────────────────────────────────────────────────

export interface PropertyMapItem {
  id: string;
  title: string;
  price: string;
  address: string;
  image: string;
  propertyStatus: "available" | "rented" | "unavailable";
  coordinates: [number, number]; // [lng, lat]
}

// ─── Get all properties with coordinates for map view ─────────────────────────

export async function getOwnerPropertiesMap({
  search = "",
  status = "",
  type = "",
}: {
  search?: string;
  status?: string;
  type?: string;
}): Promise<PropertyMapItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  await dbConnect();

  const ownerId = new Types.ObjectId(session.user.id);
  const match: Record<string, unknown> = { owner: ownerId };

  if (search.trim()) {
    match.$or = [
      { propertyTitle: { $regex: search.trim(), $options: "i" } },
      { address: { $regex: search.trim(), $options: "i" } },
      { projectName: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (status) match.propertyStatus = status;
  if (type) match.propertyType = { $regex: `^${type}$`, $options: "i" };

  const docs = await Property.find(match)
    .select("propertyTitle propertyPrice photos propertyStatus address location")
    .limit(500)
    .lean();

  return docs
    .filter((doc) => {
      const [lng, lat] = doc.location?.coordinates ?? [0, 0];
      return lng !== 0 || lat !== 0;
    })
    .map((doc) => ({
      id: String(doc._id),
      title: doc.propertyTitle,
      price: doc.propertyPrice,
      address: doc.address,
      image: doc.photos?.[0] ?? "",
      propertyStatus: doc.propertyStatus as "available" | "rented" | "unavailable",
      coordinates: doc.location.coordinates as [number, number],
    }));
}

// ─── Types for property edit ──────────────────────────────────────────────────

export interface PropertyForEdit {
  id: string;
  // Step 1
  propertyType: string;
  projectName: string;
  address: string;
  road: string;
  province: string;
  district: string;
  subDistrict: string;
  zipCode: string;
  country: string;
  propertyStatus: string;
  showingDates: string[];
  showingTimeFrom: string;
  showingTimeTo: string;
  location: { type: "Point"; coordinates: [number, number] };
  // Step 2
  propertyTitle: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  unitArea: string;
  unitAreaUnit: string;
  unitNumber: string;
  propertyCondition: string;
  buildingHeight: string;
  floor: number;
  selectBuilding: string;
  customBuilding: string;
  // Step 3
  propertyFeatures: string[];
  amenities: string[];
  securityFeatures: string[];
  rentalFeatures: string[];
  propertyViews: string[];
  customFeatures: string[];
  customAmenities: string[];
  customSecurity: string[];
  customRentalFeatures: string[];
  customViews: string[];
  // Step 4
  photos: string[];
  hasFloorPlan: boolean;
  floorPlanImages: string[];
  ownershipVerification: string;
  ownershipDocuments: string[];
  // Step 5
  visitRequestPrice: string;
  propertyPrice: string;
  contracts: Array<{ months: number; rentPrice: string; securityDeposit: string }>;
}

// ─── Get full property data for the edit form ─────────────────────────────────

export async function getPropertyForEdit(id: string): Promise<PropertyForEdit | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await dbConnect();

  if (!Types.ObjectId.isValid(id)) return null;

  const ownerId = new Types.ObjectId(session.user.id);
  const propertyId = new Types.ObjectId(id);

  const p = await Property.findOne({ _id: propertyId, owner: ownerId }).lean();
  if (!p) return null;

  return {
    id: String(p._id),
    propertyType:        p.propertyType ?? "",
    projectName:         p.projectName ?? "",
    address:             p.address ?? "",
    road:                p.road ?? "",
    province:            p.province ?? "",
    district:            p.district ?? "",
    subDistrict:         p.subDistrict ?? "",
    zipCode:             p.zipCode ?? "",
    country:             p.country ?? "TH",
    propertyStatus:      p.propertyStatus ?? "",
    showingDates:        p.showingDates ?? [],
    showingTimeFrom:     p.showingTimeFrom ?? "",
    showingTimeTo:       p.showingTimeTo ?? "",
    location:            { type: "Point", coordinates: (p.location?.coordinates as [number, number]) ?? [0, 0] },
    propertyTitle:       p.propertyTitle ?? "",
    description:         p.description ?? "",
    bedrooms:            p.bedrooms ?? 1,
    bathrooms:           p.bathrooms ?? 1,
    unitArea:            p.unitArea ?? "",
    unitAreaUnit:        p.unitAreaUnit ?? "sqm",
    unitNumber:          p.unitNumber ?? "",
    propertyCondition:   p.propertyCondition ?? "",
    buildingHeight:      p.buildingHeight ?? "",
    floor:               p.floor ?? 1,
    selectBuilding:      p.selectBuilding ?? "",
    customBuilding:      p.customBuilding ?? "",
    propertyFeatures:    p.propertyFeatures ?? [],
    amenities:           p.amenities ?? [],
    securityFeatures:    p.securityFeatures ?? [],
    rentalFeatures:      p.rentalFeatures ?? [],
    propertyViews:       p.propertyViews ?? [],
    customFeatures:      p.customFeatures ?? [],
    customAmenities:     p.customAmenities ?? [],
    customSecurity:      p.customSecurity ?? [],
    customRentalFeatures: p.customRentalFeatures ?? [],
    customViews:         p.customViews ?? [],
    photos:              p.photos ?? [],
    hasFloorPlan:        p.hasFloorPlan ?? false,
    floorPlanImages:     p.floorPlanImages ?? [],
    ownershipVerification: p.ownershipVerification ?? "",
    ownershipDocuments:  p.ownershipDocuments ?? [],
    visitRequestPrice:   p.visitRequestPrice ?? "",
    propertyPrice:       p.propertyPrice ?? "",
    contracts:           (p.contracts ?? []) as Array<{ months: number; rentPrice: string; securityDeposit: string }>,
  };
}

// ─── Types for property detail ────────────────────────────────────────────────

export interface PropertyOwnerDetail {
  name: string;
  location: string;
  avatar: string;
  otherProperties: Array<{
    id: string;
    image: string;
    title: string;
    price: string;
    propertyStatus: "available" | "rented" | "unavailable";
    coordinates: [number, number];
  }>;
}

export interface PropertyDetail {
  id: string;
  title: string;
  address: string;
  price: string;
  priceNum: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  unitArea: string;
  unitAreaUnit: string;
  floor: number;
  description: string;
  propertyStatus: "available" | "rented" | "unavailable";
  approvalStatus: "pending" | "approved" | "rejected";
  contracts: Array<{ months: number; rentPrice: string; securityDeposit: string }>;
  amenities: string[];
  customAmenities: string[];
  propertyFeatures: string[];
  customFeatures: string[];
  securityFeatures: string[];
  customSecurity: string[];
  propertyViews: string[];
  customViews: string[];
  rentalFeatures: string[];
  customRentalFeatures: string[];
  coordinates: [number, number];
  owner: PropertyOwnerDetail;
}

// ─── Get full property detail for the owner ───────────────────────────────────

export async function getPropertyDetail(id: string): Promise<PropertyDetail | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await dbConnect();

  if (!Types.ObjectId.isValid(id)) return null;

  const ownerId = new Types.ObjectId(session.user.id);
  const propertyId = new Types.ObjectId(id);

  const property = await Property.findOne({ _id: propertyId, owner: ownerId }).lean();
  if (!property) return null;

  // Fetch owner user info
  const User = (await import("@/models/User")).default;
  const ownerUser = await User.findById(ownerId)
    .select("firstName lastName profileImage city stateProvince")
    .lean();

  // Fetch owner's other properties for map / building gallery
  const otherProps = await Property.find({ owner: ownerId, _id: { $ne: propertyId } })
    .select("propertyTitle propertyPrice photos propertyStatus location")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const ownerName = ownerUser
    ? `${ownerUser.firstName} ${ownerUser.lastName}`
    : "Property Owner";

  const ownerLocation = [ownerUser?.city, ownerUser?.stateProvince]
    .filter(Boolean)
    .join(", ");

  const priceNum = parseFloat(String(property.propertyPrice).replace(/,/g, "")) || 0;

  return {
    id: String(property._id),
    title: property.propertyTitle,
    address: property.address,
    price: property.propertyPrice,
    priceNum,
    images: property.photos ?? [],
    bedrooms: property.bedrooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
    unitArea: property.unitArea ?? "",
    unitAreaUnit: property.unitAreaUnit ?? "sqm",
    floor: property.floor ?? 1,
    description: property.description ?? "",
    propertyStatus: property.propertyStatus as "available" | "rented" | "unavailable",
    approvalStatus: property.approvalStatus as "pending" | "approved" | "rejected",
    contracts: (property.contracts ?? []) as Array<{
      months: number;
      rentPrice: string;
      securityDeposit: string;
    }>,
    amenities: property.amenities ?? [],
    customAmenities: property.customAmenities ?? [],
    propertyFeatures: property.propertyFeatures ?? [],
    customFeatures: property.customFeatures ?? [],
    securityFeatures: property.securityFeatures ?? [],
    customSecurity: property.customSecurity ?? [],
    propertyViews: property.propertyViews ?? [],
    customViews: property.customViews ?? [],
    rentalFeatures: property.rentalFeatures ?? [],
    customRentalFeatures: property.customRentalFeatures ?? [],
    coordinates: (property.location?.coordinates as [number, number]) ?? [0, 0],
    owner: {
      name: ownerName,
      location: ownerLocation,
      avatar: ownerUser?.profileImage ?? "",
      otherProperties: otherProps.map((p) => ({
        id: String(p._id),
        image: p.photos?.[0] ?? "",
        title: p.propertyTitle,
        price: p.propertyPrice,
        propertyStatus: p.propertyStatus as "available" | "rented" | "unavailable",
        coordinates: (p.location?.coordinates as [number, number]) ?? [0, 0],
      })),
    },
  };
}

// ─── Get stats for the stats cards ───────────────────────────────────────────

export async function getOwnerPropertyStats(): Promise<PropertyStats> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { total: 0, available: 0, rented: 0, pending: 0 };
  }

  await dbConnect();

  const ownerId = new Types.ObjectId(session.user.id);

  const [result] = await Property.aggregate<PropertyStats>([
    { $match: { owner: ownerId } },
    {
      $group: {
        _id: null,
        total:     { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ["$propertyStatus", "available"] }, 1, 0] } },
        rented:    { $sum: { $cond: [{ $eq: ["$propertyStatus", "rented"]    }, 1, 0] } },
        pending:   { $sum: { $cond: [{ $eq: ["$approvalStatus", "pending"]   }, 1, 0] } },
      },
    },
    { $project: { _id: 0, total: 1, available: 1, rented: 1, pending: 1 } },
  ]);

  return result ?? { total: 0, available: 0, rented: 0, pending: 0 };
}
