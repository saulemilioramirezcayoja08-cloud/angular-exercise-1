export interface SalePrintData {
  saleNumber: string;
  date: string;
  status: string;
  currency: string;
  notes: string | null;
  
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  
  warehouseName: string;
  paymentMethod: string | null;
  username: string | null;
  
  orderNumber: string;
  
  items: SalePrintItem[];
  
  subtotal: number;
  total: number;
  advances: number;
  balance: number;
  itemCount: number;
}

export interface SalePrintItem {
  productName: string;
  sku: string;
  uom: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string | null;
}