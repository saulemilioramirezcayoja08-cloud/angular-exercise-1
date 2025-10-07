export interface EditableProduct {
  id: number;
  sku: string;
  name: string;
  uom: string;
  quantity: number;
  price: number;
  discount: number;
  notes: string;
}

export interface QuotationTotals {
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
}

export interface QuotationMetadata {
  customerId: number;
  warehouseId: number;
  currency: string;
  userId: number;
}

export interface ProductUpdateEvent {
  products: EditableProduct[];
}

export interface NotesUpdateEvent {
  notes: string;
}
