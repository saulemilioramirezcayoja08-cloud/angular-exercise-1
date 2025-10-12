export interface SaleActionResponse {
  success: boolean;
  message: string;
  data: SaleActionData | null;
}

export interface SaleActionData {
  id: number;
  number: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELED';
}
