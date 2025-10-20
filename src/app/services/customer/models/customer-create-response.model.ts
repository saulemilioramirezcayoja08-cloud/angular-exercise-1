export interface CustomerCreateResponse {
  success: boolean;
  message: string;
  data: CustomerCreatedData | null;
}

export interface CustomerCreatedData {
  id: number;
  taxId: string | null;
  name: string;
  email: string | null;
}