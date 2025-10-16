export interface PurchaseDetailResponse {
  success: boolean;
  message: string;
  data: PurchaseDetailData | null;
}

export interface PurchaseDetailData {
  id: number;
  number: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELED';
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: SupplierInfo;
  warehouse: WarehouseInfo;
  payment: PaymentInfo | null;
  user: UserInfo | null;
  details: PurchaseDetailInfo[];
  totals: TotalsInfo;
  stockInfo: StockInfo;
}

export interface SupplierInfo {
  id: number;
  name: string;
}

export interface WarehouseInfo {
  id: number;
  name: string;
}

export interface PaymentInfo {
  id: number;
  name: string;
}

export interface UserInfo {
  id: number;
  username: string;
}

export interface PurchaseDetailInfo {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string | null;
}

export interface TotalsInfo {
  purchaseTotal: number;
  itemCount: number;
}

export interface StockInfo {
  stockIncreased: boolean;
}
