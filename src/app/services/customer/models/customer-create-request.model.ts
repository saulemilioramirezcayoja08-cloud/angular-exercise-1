export interface CustomerCreateRequest {
  taxId?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  userId?: number;
}