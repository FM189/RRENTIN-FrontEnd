"use server";

import type { PipelineStage } from "mongoose";
import { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import type { SortOption } from "@/types/tenant-properties";
import { SORT_MAP, DEFAULT_SORT } from "@/types/tenant-properties";
import type { PropertyDetail } from "@/actions/properties";

// ─── Shared types ──────────────────────────────────────────────────────────────

export interface PriceRange {
  value: string;      // URL param, e.g. "10000-30000" or "50000+"
  label: string;      // Human-readable label
  min: number;
  max: number | null; // null = open-ended upper bound
}

export interface TenantFilterOptions {
  types: string[];
  locations: string[];
  priceRanges: PriceRange[];
}

export interface TenantPropertyListItem {
  id: string;
  title: string;
  type: string;
  address: string;
  province: string;
  propertyPrice: string;  // overall listing price from owner
  minRentPrice: number;   // lowest monthly rent across all contracts
  bedrooms: number;
  bathrooms: number;
  unitArea: string;
  unitAreaUnit: string;
  photoCount: number;
  image: string;
  propertyStatus: "available" | "rented" | "unavailable";
}

export interface TenantPropertiesResult {
  properties: TenantPropertyListItem[];
  total: number;
  totalPages: number;
  page: number;
}

// ─── Price bucket generation ───────────────────────────────────────────────────

const THB_BREAKPOINTS = [
  5_000, 10_000, 15_000, 20_000, 30_000,
  50_000, 75_000, 100_000, 150_000, 200_000, 300_000,
];

function generatePriceBuckets(minPrice: number, maxPrice: number): PriceRange[] {
  if (maxPrice <= 0) return [];

  const buckets: PriceRange[] = [];
  let prev = 0;

  for (const bp of THB_BREAKPOINTS) {
    if (bp > maxPrice * 1.1) break;
    if (bp <= minPrice) { prev = bp; continue; }

    buckets.push({
      value: `${prev}-${bp}`,
      label: prev === 0
        ? `Under ${bp.toLocaleString("en")} THB`
        : `${prev.toLocaleString("en")} – ${bp.toLocaleString("en")} THB`,
      min: prev,
      max: bp,
    });
    prev = bp;
  }

  if (prev < maxPrice) {
    buckets.push({
      value: `${prev}+`,
      label: `${prev.toLocaleString("en")}+ THB`,
      min: prev,
      max: null,
    });
  }

  return buckets;
}

// ─── Helper: convert a contracts.rentPrice string → double ───────────────────
// Used inside $unwind context where the field is "$contracts.rentPrice"

const RENT_PRICE_FROM_UNWOUND = {
  $convert: {
    input: {
      $replaceAll: {
        input: { $ifNull: ["$contracts.rentPrice", "0"] },
        find: ",",
        replacement: "",
      },
    },
    to: "double",
    onError: 0,
    onNull: 0,
  },
};

// ─── Helper: compute minRentPrice across all contracts on a single doc ────────
// Used inside $addFields — iterates the contracts array with $$c variable

const MIN_RENT_PRICE_EXPR = {
  $min: {
    $map: {
      input: { $ifNull: ["$contracts", []] },
      as: "c",
      in: {
        $convert: {
          input: {
            $replaceAll: {
              input: { $ifNull: ["$$c.rentPrice", "0"] },
              find: ",",
              replacement: "",
            },
          },
          to: "double",
          onError: 0,
          onNull: 0,
        },
      },
    },
  },
};

// ─── Get filter options from live property data ────────────────────────────────
// • $unwind contracts so we can compute min/max across every rentPrice entry.
// • No approval/status filter — we want the full catalog in the dropdowns.

interface FilterAggResult {
  types: string[];
  locations: string[];
  minPrice: number;
  maxPrice: number;
}

export async function getTenantFilterOptions(): Promise<TenantFilterOptions> {
  await dbConnect();

  const [result] = await Property.aggregate<FilterAggResult>([
    // Only approved + available properties that have at least one contract
    { $match: { approvalStatus: "approved", propertyStatus: "available", "contracts.0": { $exists: true } } },
    // Explode contracts so we can aggregate on each rentPrice
    { $unwind: "$contracts" },
    { $addFields: { rentPriceNum: RENT_PRICE_FROM_UNWOUND } },
    {
      $group: {
        _id: null,
        types:     { $addToSet: { $toLower: { $trim: { input: "$propertyType" } } } },
        locations: { $addToSet: { $trim: { input: "$province" } } },
        minPrice:  { $min: "$rentPriceNum" },
        maxPrice:  { $max: "$rentPriceNum" },
      },
    },
    { $project: { _id: 0, types: 1, locations: 1, minPrice: 1, maxPrice: 1 } },
  ]);

  if (!result) return { types: [], locations: [], priceRanges: [] };

  const types = (result.types ?? [])
    .filter((t): t is string => typeof t === "string" && t.length > 0)
    .sort();

  const locations = (result.locations ?? [])
    .filter((l): l is string => typeof l === "string" && l.length > 0)
    .sort();

  const priceRanges = generatePriceBuckets(
    result.minPrice ?? 0,
    result.maxPrice ?? 0
  );

  return { types, locations, priceRanges };
}

// ─── Get paginated + filtered tenant-facing properties ────────────────────────

const TENANT_PROPERTIES_PER_PAGE = 9;

interface DocShape {
  _id: unknown;
  propertyTitle?: string;
  propertyType?: string;
  address?: string;
  province?: string;
  propertyPrice?: string;
  minRentPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  unitArea?: string;
  unitAreaUnit?: string;
  photoCount?: number;
  photos?: string[];
  propertyStatus?: string;
}

interface FacetResult {
  metadata: Array<{ total: number }>;
  data: DocShape[];
}

export async function getTenantProperties({
  page = 1,
  search = "",
  type = "",
  priceRange = "",
  location = "",
  sort = DEFAULT_SORT,
}: {
  page?: number;
  search?: string;
  type?: string;
  priceRange?: string;
  location?: string;
  sort?: SortOption | string;
}): Promise<TenantPropertiesResult> {
  await dbConnect();

  // ── Base match — index-eligible fields first ──────────────────────────────
  const baseMatch: Record<string, unknown> = {
    approvalStatus: "approved",
    propertyStatus: "available",
    // Only include listings that have at least one rental contract
    "contracts.0": { $exists: true },
  };

  if (search.trim()) {
    baseMatch.$or = [
      { propertyTitle: { $regex: search.trim(), $options: "i" } },
      { address:       { $regex: search.trim(), $options: "i" } },
      { projectName:   { $regex: search.trim(), $options: "i" } },
      { province:      { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (type) {
    baseMatch.propertyType = { $regex: `^${type.trim()}$`, $options: "i" };
  }

  if (location) {
    baseMatch.province = { $regex: `^${location.trim()}$`, $options: "i" };
  }

  // ── Price range filter — applied after computing minRentPrice ─────────────
  let priceMatch: Record<string, unknown> | null = null;

  if (priceRange) {
    if (priceRange.endsWith("+")) {
      const min = parseFloat(priceRange);
      if (!isNaN(min)) priceMatch = { minRentPrice: { $gte: min } };
    } else {
      const [rawMin, rawMax] = priceRange.split("-").map(Number);
      if (!isNaN(rawMin) && !isNaN(rawMax)) {
        priceMatch = { minRentPrice: { $gte: rawMin, $lt: rawMax } };
      }
    }
  }

  const sortOrder = SORT_MAP[sort as SortOption] ?? SORT_MAP[DEFAULT_SORT];

  const limit = TENANT_PROPERTIES_PER_PAGE;
  const skip  = (page - 1) * limit;

  const pipeline: PipelineStage[] = [
    { $match: baseMatch },
    // Compute the cheapest contract rentPrice as minRentPrice for filtering & display
    { $addFields: { minRentPrice: MIN_RENT_PRICE_EXPR } },
    ...(priceMatch ? [{ $match: priceMatch }] : []),
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: sortOrder },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              propertyTitle:  1,
              propertyType:   1,
              address:        1,
              province:       1,
              propertyPrice:  1,
              minRentPrice:   1,
              bedrooms:       1,
              bathrooms:      1,
              unitArea:       1,
              unitAreaUnit:   1,
              photoCount:     { $size: { $ifNull: ["$photos", []] } },
              photos:         { $slice: ["$photos", 1] },
              propertyStatus: 1,
            },
          },
        ],
      },
    },
  ];

  const [result] = await Property.aggregate<FacetResult>(pipeline);

  const total = result?.metadata?.[0]?.total ?? 0;
  const docs  = result?.data ?? [];

  const properties: TenantPropertyListItem[] = docs.map((doc) => ({
    id:             String(doc._id),
    title:          String(doc.propertyTitle ?? ""),
    type:           String(doc.propertyType ?? ""),
    address:        String(doc.address ?? ""),
    province:       String(doc.province ?? ""),
    propertyPrice:  String(doc.propertyPrice ?? ""),
    minRentPrice:   Number(doc.minRentPrice ?? 0),
    bedrooms:       Number(doc.bedrooms ?? 0),
    bathrooms:      Number(doc.bathrooms ?? 0),
    unitArea:       String(doc.unitArea ?? ""),
    unitAreaUnit:   String(doc.unitAreaUnit ?? "sqm"),
    photoCount:     Number(doc.photoCount ?? 0),
    image:          doc.photos?.[0] ?? "",
    propertyStatus: (doc.propertyStatus as TenantPropertyListItem["propertyStatus"]) ?? "available",
  }));

  return { properties, total, totalPages: Math.ceil(total / limit), page };
}

// ─── Types for map view ───────────────────────────────────────────────────────

export interface TenantPropertyMapItem {
  id: string;
  title: string;
  minRentPrice: number;
  address: string;
  image: string;
  coordinates: [number, number]; // [lng, lat]
}

// ─── Get all (approved + available) properties with coordinates for map ────────

export async function getTenantPropertiesMap({
  search = "",
  type = "",
  priceRange = "",
  location = "",
}: {
  search?: string;
  type?: string;
  priceRange?: string;
  location?: string;
}): Promise<TenantPropertyMapItem[]> {
  await dbConnect();

  const baseMatch: Record<string, unknown> = {
    approvalStatus: "approved",
    propertyStatus: "available",
    "contracts.0": { $exists: true },
  };

  if (search.trim()) {
    baseMatch.$or = [
      { propertyTitle: { $regex: search.trim(), $options: "i" } },
      { address:       { $regex: search.trim(), $options: "i" } },
      { projectName:   { $regex: search.trim(), $options: "i" } },
      { province:      { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (type)     baseMatch.propertyType = { $regex: `^${type.trim()}$`,     $options: "i" };
  if (location) baseMatch.province     = { $regex: `^${location.trim()}$`, $options: "i" };

  let priceMatch: Record<string, unknown> | null = null;
  if (priceRange) {
    if (priceRange.endsWith("+")) {
      const min = parseFloat(priceRange);
      if (!isNaN(min)) priceMatch = { minRentPrice: { $gte: min } };
    } else {
      const [rawMin, rawMax] = priceRange.split("-").map(Number);
      if (!isNaN(rawMin) && !isNaN(rawMax)) {
        priceMatch = { minRentPrice: { $gte: rawMin, $lt: rawMax } };
      }
    }
  }

  const pipeline: PipelineStage[] = [
    { $match: baseMatch },
    { $addFields: { minRentPrice: MIN_RENT_PRICE_EXPR } },
    ...(priceMatch ? [{ $match: priceMatch }] : []),
    { $limit: 500 },
    {
      $project: {
        propertyTitle: 1,
        address:       1,
        minRentPrice:  1,
        location:      1,
        photos:        { $slice: ["$photos", 1] },
      },
    },
  ];

  const docs = await Property.aggregate(pipeline);

  return docs
    .filter((doc) => {
      const [lng, lat] = doc.location?.coordinates ?? [0, 0];
      return lng !== 0 || lat !== 0;
    })
    .map((doc) => ({
      id:           String(doc._id),
      title:        String(doc.propertyTitle ?? ""),
      minRentPrice: Number(doc.minRentPrice ?? 0),
      address:      String(doc.address ?? ""),
      image:        doc.photos?.[0] ?? "",
      coordinates:  doc.location.coordinates as [number, number],
    }));
}

// ─── Property detail for side drawer ─────────────────────────────────────────

export interface TenantPropertyDetail {
  id: string;
  ownerId: string;
  title: string;
  type: string;
  description: string;
  address: string;
  province: string;
  minRentPrice: number;
  visitRequestPrice: string;
  showingDates: string[];
  showingTimeFrom: string;
  showingTimeTo: string;
  bedrooms: number;
  bathrooms: number;
  unitArea: string;
  unitAreaUnit: string;
  floor: number;
  photos: string[];
  coordinates: [number, number] | null;
}

export async function getTenantPropertyDetail(id: string): Promise<TenantPropertyDetail | null> {
  await dbConnect();

  try {
    const doc = await Property.findById(id)
      .select("owner propertyTitle propertyType description address province bedrooms bathrooms unitArea unitAreaUnit floor photos contracts location visitRequestPrice showingDates showingTimeFrom showingTimeTo")
      .lean();

    if (!doc) return null;

    // Compute minRentPrice from contracts
    const prices = (doc.contracts ?? []).map((c) =>
      parseFloat(String(c.rentPrice).replace(/,/g, "")) || 0,
    );
    const minRentPrice = prices.length > 0 ? Math.min(...prices) : 0;

    const [lng, lat] = doc.location?.coordinates ?? [0, 0];

    return {
      id:           String(doc._id),
      ownerId:      String((doc as unknown as { owner?: unknown }).owner ?? ""),
      title:        String(doc.propertyTitle ?? ""),
      type:         String(doc.propertyType  ?? ""),
      description:  String(doc.description   ?? ""),
      address:      String(doc.address       ?? ""),
      province:     String(doc.province      ?? ""),
      minRentPrice,
      bedrooms:     Number(doc.bedrooms    ?? 0),
      bathrooms:    Number(doc.bathrooms   ?? 0),
      unitArea:     String(doc.unitArea    ?? ""),
      unitAreaUnit: String(doc.unitAreaUnit ?? "sqm"),
      floor:             Number(doc.floor       ?? 0),
      photos:            (doc.photos ?? []) as string[],
      coordinates:       (lng !== 0 || lat !== 0) ? [lng, lat] : null,
      visitRequestPrice: String((doc as unknown as { visitRequestPrice?: string }).visitRequestPrice ?? ""),
      showingDates:      ((doc as unknown as { showingDates?: string[] }).showingDates ?? []) as string[],
      showingTimeFrom:   String((doc as unknown as { showingTimeFrom?: string }).showingTimeFrom ?? ""),
      showingTimeTo:     String((doc as unknown as { showingTimeTo?: string }).showingTimeTo ?? ""),
    };
  } catch {
    return null;
  }
}

// ─── Booking property data ────────────────────────────────────────────────────

export interface TenantBookingProperty {
  id: string;
  title: string;
  type: string;
  address: string;
  province: string;
  photos: string[];
  bedrooms: number;
  bathrooms: number;
  unitArea: string;
  unitAreaUnit: string;
  contracts: Array<{
    months: number;
    rentPrice: string;
    securityDeposit: string;
  }>;
  customFees: Array<{ name: string; amount: number }>;
}

export async function getTenantBookingProperty(id: string): Promise<TenantBookingProperty | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) return null;

  try {
    const doc = await Property.findOne({
      _id: new Types.ObjectId(id),
      approvalStatus: "approved",
    })
      .select("propertyTitle propertyType address province photos bedrooms bathrooms unitArea unitAreaUnit contracts customFees")
      .lean();

    if (!doc) return null;

    return {
      id:           String(doc._id),
      title:        String(doc.propertyTitle ?? ""),
      type:         String(doc.propertyType  ?? ""),
      address:      String(doc.address       ?? ""),
      province:     String(doc.province      ?? ""),
      photos:       (doc.photos ?? []) as string[],
      bedrooms:     Number(doc.bedrooms  ?? 0),
      bathrooms:    Number(doc.bathrooms ?? 0),
      unitArea:     String(doc.unitArea    ?? ""),
      unitAreaUnit: String(doc.unitAreaUnit ?? "sqm"),
      contracts:    ((doc.contracts ?? []) as Array<{ months: number; rentPrice: string; securityDeposit: string }>).map((c) => ({
        months:          Number(c.months),
        rentPrice:       String(c.rentPrice),
        securityDeposit: String(c.securityDeposit),
      })),
      customFees: ((doc as unknown as { customFees?: Array<{ name: string; amount: number }> }).customFees ?? []).map((f) => ({
        name:   String(f.name),
        amount: Number(f.amount),
      })),
    };
  } catch {
    return null;
  }
}

// ─── Full property detail for the tenant detail page ─────────────────────────
// Like getPropertyDetail but WITHOUT the owner filter — looks up any approved property.

export async function getTenantPropertyDetailFull(id: string): Promise<PropertyDetail | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) return null;

  const propertyId = new Types.ObjectId(id);

  const property = await Property.findOne({
    _id: propertyId,
    approvalStatus: "approved",
  }).lean();
  if (!property) return null;

  const ownerId = property.owner as Types.ObjectId;

  // Fetch owner user info
  const User = (await import("@/models/User")).default;
  const ownerUser = await User.findById(ownerId)
    .select("firstName lastName profileImage city stateProvince")
    .lean();

  // Fetch owner's other approved properties for gallery
  const otherProps = await Property.find({
    owner: ownerId,
    _id: { $ne: propertyId },
    approvalStatus: "approved",
  })
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
