export interface QuotationSearchResponse {
  success: boolean;
  message: string;
  data: QuotationSearchData[] | null;
  pagination: PaginationMetadata | null;
}

export interface QuotationSearchData {
  id: number;
  number: string;
  status: string;
  customerName: string;
  warehouseName: string;
  username: string | null;
  currency: string;
  totalAmount: number;
  itemCount: number;
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
