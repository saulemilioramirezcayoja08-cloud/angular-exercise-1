export interface DraftOrderRequest {
    customerId: number;
    warehouseId: number;
    currency?: string;
    paymentId?: number;
    quotationId?: number;
    notes?: string;
    userId?: number;
    details: DraftOrderDetailRequest[];
}

export interface DraftOrderDetailRequest {
    productId: number;
    quantity: number;
    price: number;
    notes?: string;
}