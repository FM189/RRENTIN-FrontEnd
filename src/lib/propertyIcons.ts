const BASE = "/images/icons/dashboard/property/detail";

function match(name: string, keywords: string[]): boolean {
  const n = name.toLowerCase().replace(/[_\s-]/g, "");
  return keywords.some((k) => n.includes(k));
}

export function getAmenityIcon(name: string): string {
  if (match(name, ["pool", "swim"]))        return `${BASE}/amenity-pool.png`;
  if (match(name, ["gym", "fitness"]))      return `${BASE}/amenity-gym.png`;
  if (match(name, ["park"]))                return `${BASE}/amenity-parking.png`;
  if (match(name, ["garden", "privategar"])) return `${BASE}/amenity-garden.png`;
  if (match(name, ["balcony", "terrace"]))  return `${BASE}/amenity-balcony.png`;
  if (match(name, ["internet", "wifi", "highspeed"])) return `${BASE}/amenity-internet.png`;
  if (match(name, ["maid"]))                return `${BASE}/amenity-maid.png`;
  if (match(name, ["study"]))               return `${BASE}/amenity-study.png`;
  if (match(name, ["bathtub", "jacuzzi"]))  return `${BASE}/amenity-bathtub.png`;
  if (match(name, ["barbeque", "bbq", "barbecue"])) return `${BASE}/amenity-barbeque.png`;
  return `${BASE}/amenity-balcony.png`;
}

export function getFurnishIcon(name: string): string {
  if (match(name, ["wardrobe", "closet"])) return `${BASE}/furnish-wardrobe.png`;
  if (match(name, ["furnished"]))          return `${BASE}/furnish-furnished.png`;
  if (match(name, ["renovated"]))          return `${BASE}/furnish-renovated.png`;
  if (match(name, ["tv", "theatre", "theater"])) return `${BASE}/furnish-tv.png`;
  return `${BASE}/furnish-furnished.png`;
}

export function getSecurityIcon(name: string): string {
  if (match(name, ["guard"]))    return `${BASE}/security-guard.png`;
  if (match(name, ["24", "24h"])) return `${BASE}/security-24h.png`;
  if (match(name, ["cctv", "camera"])) return `${BASE}/security-cctv.png`;
  return `${BASE}/security-guard.png`;
}

export function getViewIcon(name: string): string {
  if (match(name, ["canal", "river", "water"])) return `${BASE}/view-canal.png`;
  if (match(name, ["city", "urban"]))           return `${BASE}/view-city.png`;
  if (match(name, ["garden"]))                  return `${BASE}/view-garden.png`;
  if (match(name, ["green", "forest", "park"])) return `${BASE}/view-green.png`;
  return `${BASE}/view-city.png`;
}

export function getRentalIcon(name: string): string {
  if (match(name, ["pet", "dog", "cat"]))          return `${BASE}/amenity-garden.png`;
  if (match(name, ["smoke", "smoking"]))            return `${BASE}/amenity-barbeque.png`;
  if (match(name, ["shortterm", "short"]))          return `${BASE}/amenity-study.png`;
  if (match(name, ["longterm", "long"]))            return `${BASE}/amenity-study.png`;
  if (match(name, ["airbnb", "sublease", "sublet"])) return `${BASE}/amenity-internet.png`;
  return `${BASE}/amenity-balcony.png`;
}

/** Formats a raw feature string into a human-readable label */
export function featureLabel(name: string): string {
  return name
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
