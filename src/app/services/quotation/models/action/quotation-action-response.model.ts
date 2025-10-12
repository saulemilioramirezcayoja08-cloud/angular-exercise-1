export interface QuotationActionResponse {
  success: boolean;
  message: string;
  data: QuotationActionData | null;
}

export interface QuotationActionData {
  id: number;
  number: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELED';
}
