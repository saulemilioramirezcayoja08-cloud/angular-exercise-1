export interface OrderAdvanceResponse {
  success: boolean;
  message: string;
  data: OrderAdvanceData | null;
}

export interface OrderAdvanceData {
  id: number;
  orderId: number;
  amount: number;
}
