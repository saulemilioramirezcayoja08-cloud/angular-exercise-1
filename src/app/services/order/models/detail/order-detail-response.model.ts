export interface OrderDetailResponse {
  success: boolean;
  message: string;
  data: OrderDetailData | null;
}

export interface OrderDetailData {
  id: number;
  number: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELED';
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: CustomerInfo;
  warehouse: WarehouseInfo;
  payment: PaymentInfo | null;
  user: UserInfo | null;
  quotation: QuotationInfo | null;
  details: OrderDetailInfo[];
  advances: AdvanceInfo[];
  totals: TotalsInfo;
  sale: SaleInfo | null;
  reservations: ReservationsInfo;
}

export interface CustomerInfo {
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

export interface QuotationInfo {
  id: number;
  number: string;
}

export interface OrderDetailInfo {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string | null;
}

export interface AdvanceInfo {
  id: number;
  amount: number;
  createdAt: string;
  username: string | null;
}

export interface TotalsInfo {
  orderTotal: number;
  totalAdvances: number;
  pendingAmount: number;
  itemCount: number;
}

export interface SaleInfo {
  id: number;
  number: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELED';
}

export interface ReservationsInfo {
  count: number;
  status: string;
}
