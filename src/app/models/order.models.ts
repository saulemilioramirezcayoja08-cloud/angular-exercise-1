export interface OrderMetadata {
    customerId: number;
    warehouseId: number;
    currency: string;
    userId: number;
    paymentId?: number;
    quotationId?: number;
}