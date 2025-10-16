export interface PurchaseCreateRequest {
  supplierId: number;
  warehouseId: number;
  currency?: string;
  paymentId?: number;
  notes?: string;
  userId?: number;
  details: PurchaseDetailRequest[];
}

export interface PurchaseDetailRequest {
  productId: number;
  quantity: number;
  price: number;
  notes?: string;
}
