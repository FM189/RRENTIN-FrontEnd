// Shared types and constants for tenant properties — NOT a server action file.
// Import from here in both client components and the server action.

export type SortOption = "newest" | "oldest" | "price_asc" | "price_desc" | "beds_desc";

export const DEFAULT_SORT: SortOption = "newest";

export const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: "newest",     labelKey: "sortNewest"    },
  { value: "oldest",     labelKey: "sortOldest"    },
  { value: "price_asc",  labelKey: "sortPriceAsc"  },
  { value: "price_desc", labelKey: "sortPriceDesc" },
  { value: "beds_desc",  labelKey: "sortBedsDesc"  },
];

export const SORT_MAP: Record<SortOption, Record<string, 1 | -1>> = {
  newest:     { createdAt: -1 },
  oldest:     { createdAt: 1 },
  price_asc:  { minRentPrice: 1,  createdAt: -1 },
  price_desc: { minRentPrice: -1, createdAt: -1 },
  beds_desc:  { bedrooms: -1,     createdAt: -1 },
};
