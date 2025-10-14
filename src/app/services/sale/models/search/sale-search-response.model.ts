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
  username: string | null;
  saleTotalAmount: number;
  itemCount: number;
  orderId: number;
  orderTotalAdvances: number;
  createdAt: string;
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