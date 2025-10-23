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
  totalQuantity: number;
  advances: number;
  balance: number;
  itemCount: number;
  amountInWords: string;
}

export interface SalePrintItem {
  itemNumber: string;
  productName: string;
  sku: string;
  uom: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string | null;
}
