export interface PurchaseActionResponse {
  success: boolean;
  message: string;
  data: PurchaseActionData | null;
}

export interface PurchaseActionData {
  id: number;
  number: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELED';
}
