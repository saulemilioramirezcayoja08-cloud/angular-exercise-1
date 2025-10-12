export interface SaleHistoryResponse {
  success: boolean;
  message: string;
  data: SaleHistoryData[] | null;
}

export interface SaleHistoryData {
  number: string;
  quantity: number;
  price: number;
}
