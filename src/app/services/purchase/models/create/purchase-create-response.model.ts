export interface PurchaseCreateResponse {
  success: boolean;
  message: string;
  data: PurchaseCreateData | null;
}

export interface PurchaseCreateData {
  id: number;
  number: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELED';
}
