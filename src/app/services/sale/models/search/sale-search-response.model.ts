export interface SaleSearchResponse {
  success: boolean;
  message: string;
  data: SaleSearchData[] | null;
  pagination: PaginationMetadata | null;
}

export interface SaleSearchData {
  id: number;
  number: string;
  status: string;
  customerName: string;
  warehouseName: string;
  username: string | null;
  currency: string;
  saleTotalAmount: number;
  itemCount: number;
  paymentName: string | null;
  orderId: number;
  orderTotalAdvances: number;
  createdAt: string;
  updatedAt: string;
  isProcessing?: boolean;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
