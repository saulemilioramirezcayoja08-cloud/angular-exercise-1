export interface DraftQuotationResponse {
  success: boolean;
  message: string;
  data: DraftQuotationData | null;
}

export interface DraftQuotationData {
  id: number;
  number: string;
  status: string;
}
