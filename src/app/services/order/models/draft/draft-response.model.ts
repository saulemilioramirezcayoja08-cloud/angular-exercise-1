export interface DraftOrderResponse {
    success: boolean;
    message: string;
    data: DraftOrderData | null;
}

export interface DraftOrderData {
    id: number;
    number: string;
    status: string;
}