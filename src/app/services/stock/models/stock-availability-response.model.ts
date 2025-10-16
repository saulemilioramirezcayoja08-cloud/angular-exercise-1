export interface StockAvailabilityResponse {
  success: boolean;
  message: string;
  data: WarehouseStock[] | null;
}

export interface WarehouseStock {
  code: string;
  existence: number;
  reserved: number;
  available: number;
}