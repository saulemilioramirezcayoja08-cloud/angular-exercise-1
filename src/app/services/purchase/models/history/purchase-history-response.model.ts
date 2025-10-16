export interface PurchaseHistoryResponse {
  success: boolean;
  message: string;
  data: PurchaseHistoryData[] | null;
}

export interface PurchaseHistoryData {
  number: string;
  quantity: number;
  price: number;
}
