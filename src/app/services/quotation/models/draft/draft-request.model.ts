export interface DraftQuotationRequest {
  customerId: number;
  warehouseId: number;
  currency?: string;
  notes?: string;
  userId?: number;
  details: DraftQuotationDetailRequest[];
}

export interface DraftQuotationDetailRequest {
  productId: number;
  quantity: number;
  price: number;
  notes?: string;
}
