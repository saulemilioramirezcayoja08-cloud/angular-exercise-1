export interface ProductSearchResponse {
  success: boolean;
  message: string;
  data: ProductData[] | null;
}

export interface ProductData {
  id: number;
  sku: string;
  name: string;
  uom: string;
  price: number;
}
