export interface ProductCreateResponse {
  success: boolean;
  message: string;
  data: ProductCreatedData | null;
}

export interface ProductCreatedData {
  id: number;
  sku: string;
  name: string;
}
