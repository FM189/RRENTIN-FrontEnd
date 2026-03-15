export interface AgreementApiPayload {
  bookingId:            string;
  ownerName:            string;
  ownerAddress:         string;
  ownerPhone:           string;
  ownerSignature?:      string;
  ownerSignedAt?:       string;
  tenantName:           string;
  tenantNationality:    string;
  tenantCurrentCountry: string;
  tenantSignature?:     string;
  tenantSignedAt?:      string;
  propertyTitle:        string;
  propertyAddress:      string;
  rentalAmount:         number;
  securityDeposit:      number;
  contractMonths:       number;
  moveInDate:           string;
  moveOutDate:          string;
  paymentDueDay:        number;
  customFees:           { name: string; amount: number }[];
  includedItems:        string;
  stayDays:             number;
  dailyRate:            number;
  preview?:             boolean;
}
