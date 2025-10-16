export interface ProductCreateRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  uom: string;
  price: number;
  userId?: number;
  codes?: CodeDto[];
}

export interface CodeDto {
  type: string;
  code: string;
}
