export interface CustomerPageResponse {
  success: boolean;
  message: string;
  data: CustomerPageData | null;
}

export interface CustomerPageData {
  content: CustomerListItem[];
  pagination: PaginationInfo;
}

export interface CustomerListItem {
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