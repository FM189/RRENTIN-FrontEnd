export enum PropertyType {
  HOUSE = "house",
  VILLA = "villa",
  CONDO = "condo",
  APARTMENT = "apartment",
  TOWNHOUSE = "townhouse",
  RETAIL_SPACE = "retail_space",
  OFFICE = "office",
}

export enum PropertyStatus {
  AVAILABLE = "available",
  RENTED = "rented",
  UNAVAILABLE = "unavailable",
}

export const MAX_CONTRACTS = 5;

export interface PropertyFiles {
  photos: File[];
  floorPlans: File[];
  documents: File[];
}

export const INITIAL_PROPERTY_FILES: PropertyFiles = {
  photos: [],
  floorPlans: [],
  documents: [],
};

export interface EditPropertyFiles {
  newPhotos: File[];
  newFloorPlans: File[];
  newDocuments: File[];
  existingPhotos: string[];       // kept S3 URLs (not deleted)
  existingFloorPlans: string[];
  existingDocuments: string[];
  deletedPhotos: string[];        // removed URLs → backend deletes from S3
  deletedFloorPlans: string[];
  deletedDocuments: string[];
}

export interface ContractEntry {
  months: number;
  rentPrice: string;
  securityDeposit: string;
}

export interface AddPropertyData {
  // Step 1: Basic Info
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
  location: { type: "Point"; coordinates: [number, number] }; // [lng, lat]

  // Step 2: Property Info
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

  // Step 3: Features & Amenities
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

  // Step 4: Photos & Details
  photos: string[];
  hasFloorPlan: boolean;
  floorPlanImages: string[];
  ownershipVerification: string;
  ownershipDocuments: string[];

  // Step 5: Pricing
  visitRequestPrice: string;
  propertyPrice: string;
  contracts: ContractEntry[];
}

export const INITIAL_ADD_PROPERTY_DATA: AddPropertyData = {
  // Step 1
  propertyType: "",
  projectName: "",
  address: "",
  road: "",
  province: "",
  district: "",
  subDistrict: "",
  zipCode: "",
  country: "TH",
  propertyStatus: "",
  showingDates: [],
  showingTimeFrom: "",
  showingTimeTo: "",
  location: { type: "Point", coordinates: [0, 0] },

  // Step 2
  propertyTitle: "",
  description: "",
  bedrooms: 1,
  bathrooms: 1,
  unitArea: "",
  unitAreaUnit: "sqm",
  unitNumber: "",
  propertyCondition: "",
  buildingHeight: "",
  floor: 1,
  selectBuilding: "",
  customBuilding: "",

  // Step 3
  propertyFeatures: [],
  amenities: [],
  securityFeatures: [],
  rentalFeatures: [],
  propertyViews: [],
  customFeatures: [],
  customAmenities: [],
  customSecurity: [],
  customRentalFeatures: [],
  customViews: [],

  // Step 4
  photos: [],
  hasFloorPlan: false,
  floorPlanImages: [],
  ownershipVerification: "",
  ownershipDocuments: [],

  // Step 5
  visitRequestPrice: "",
  propertyPrice: "",
  contracts: [{ months: 1, rentPrice: "", securityDeposit: "" }],
};
