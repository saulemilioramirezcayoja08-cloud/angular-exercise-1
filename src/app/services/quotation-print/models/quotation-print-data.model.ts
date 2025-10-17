export interface QuotationPrintData {
    quotationNumber: string;
    date: string;
    time: string;
    customer: CustomerInfo;
    seller: string;
    products: PrintProduct[];
    totals: PrintTotals;
    notes: string;
    registrationDateTime: string;
    username: string;
}

export interface CustomerInfo {
    name: string;
    address: string;
    phone: string;
}

export interface PrintProduct {
    itemNumber: string;
    sku: string;
    name: string;
    origin: string;
    quantity: number;
    price: number;
    total: number;
    uom: string;
}

export interface PrintTotals {
    totalQuantity: number;
    subtotal: number;
    grandTotal: number;
    amountInWords: string;
}