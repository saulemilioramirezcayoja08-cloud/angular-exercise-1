export interface SupplierPageResponse {
  success: boolean;
  message: string;
  data: SupplierPageData | null;
}

export interface SupplierPageData {
  content: SupplierListItem[];
  pagination: PaginationInfo;
}

export interface SupplierListItem {
  id: number;
  taxId: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number | null;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}