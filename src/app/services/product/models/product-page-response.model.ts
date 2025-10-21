export interface ProductPageResponse {
  success: boolean;
  message: string;
  data: ProductPageData | null;
}

export interface ProductPageData {
  content: ProductListItem[];
  pagination: PaginationInfo;
}

export interface ProductListItem {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  uom: string;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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