export interface CustomerDetailResponse {
  success: boolean;
  message: string;
  data: CustomerDetail | null;
}

export interface CustomerDetail {
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