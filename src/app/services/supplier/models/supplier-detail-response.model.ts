export interface SupplierDetailResponse {
  success: boolean;
  message: string;
  data: SupplierDetail | null;
}

export interface SupplierDetail {
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