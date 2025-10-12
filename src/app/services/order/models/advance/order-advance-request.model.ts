export interface OrderAdvanceCreateRequest {
  orderId: number;
  amount: number;
  userId?: number;
}
