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
  username: string | null;
  totalAmount: number;
  itemCount: number;
  totalAdvances: number;
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
