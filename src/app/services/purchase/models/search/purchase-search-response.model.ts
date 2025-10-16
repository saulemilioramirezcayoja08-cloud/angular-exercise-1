export interface PurchaseSearchResponse {
  success: boolean;
  message: string;
  data: PurchaseSearchData[] | null;
  pagination: PaginationMetadata | null;
}

export interface PurchaseSearchData {
  id: number;
  number: string;
  status: string;
  supplierName: string;
  warehouseName: string;
  username: string | null;
  currency: string;
  totalAmount: number;
  itemCount: number;
  paymentName: string | null;
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
