export interface PurchaseMetadata {
  supplierId: number;
  warehouseId: number;
  currency: string;
  userId: number;
  paymentId?: number;
}

export interface EditablePurchaseProduct {
  id: number;
  sku: string;
  name: string;
  uom: string;
  quantity: number;
  price: number;
  notes: string;
}

export interface PurchaseTotals {
  subtotal: number;
  grandTotal: number;
}

export interface ProductUpdateEvent {
  products: EditablePurchaseProduct[];
}

export interface NotesUpdateEvent {
  notes: string;
}
