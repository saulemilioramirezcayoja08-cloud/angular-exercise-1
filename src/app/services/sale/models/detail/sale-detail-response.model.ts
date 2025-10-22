export interface SaleDetailResponse {
  success: boolean;
  message: string;
  data: SaleDetailData | null;
}

export interface SaleDetailData {
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
  details: SaleDetailInfo[];
  order: OrderInfo;
  advances: AdvanceInfo[];
  totals: TotalsInfo;
  reservations: ReservationsInfo;
}

export interface CustomerInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
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

export interface SaleDetailInfo {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  uom: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string | null;
}

export interface OrderInfo {
  id: number;
  number: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELED';
  notes: string | null;
  createdAt: string;
}

export interface AdvanceInfo {
  id: number;
  amount: number;
  createdAt: string;
  username: string | null;
}

export interface TotalsInfo {
  saleTotal: number;
  totalAdvances: number;
  balance: number;
  itemCount: number;
}

export interface ReservationsInfo {
  count: number;
  status: string;
}