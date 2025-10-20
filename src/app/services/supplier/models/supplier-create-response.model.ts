export interface SupplierCreateResponse {
  success: boolean;
  message: string;
  data: SupplierCreatedData | null;
}

export interface SupplierCreatedData {
  id: number;
  taxId: string | null;
  name: string;
  email: string | null;
}