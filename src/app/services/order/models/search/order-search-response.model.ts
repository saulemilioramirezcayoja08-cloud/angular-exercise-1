export interface OrderSearchResponse {
  success: boolean;
  message: string;
  data: OrderSearchData[] | null;
  pagination: PaginationMetadata | null;
}

export interface OrderSearchData {
  id: number;
  number: string;
  status: string;
  customerName: string;
  warehouseName: string;
  username: string | null;
  currency: string;
  totalAmount: number;
  itemCount: number;
  paymentName: string | null;
  totalAdvances: number;
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
