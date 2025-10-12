export interface OrderActionResponse {
  success: boolean;
  message: string;
  data: OrderActionData | null;
}

export interface OrderActionData {
  id: number;
  number: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELED';
}
