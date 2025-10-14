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
  username: string | null;
  totalAmount: number;
  itemCount: number;
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