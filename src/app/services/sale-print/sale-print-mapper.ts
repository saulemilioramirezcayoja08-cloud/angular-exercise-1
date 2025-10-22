import { Injectable } from '@angular/core';
import { SaleDetailData } from '../sale/models/detail/sale-detail-response.model';
import { SalePrintData, SalePrintItem } from './models/sale-print-data.model';

@Injectable({
  providedIn: 'root'
})
export class SalePrintMapper {
  transformToPrintData(saleDetail: SaleDetailData): SalePrintData {
    const items: SalePrintItem[] = saleDetail.details.map(detail => ({
      productName: detail.productName,
      sku: detail.productSku,
      uom: detail.uom,
      quantity: detail.quantity,
      price: detail.price,
      subtotal: detail.subtotal,
      notes: detail.notes
    }));

    return {
      saleNumber: saleDetail.number,
      date: this.formatDate(saleDetail.createdAt),
      status: saleDetail.status,
      currency: saleDetail.currency,
      notes: saleDetail.notes,
      
      customerName: saleDetail.customer.name,
      customerAddress: saleDetail.customer.address,
      customerPhone: saleDetail.customer.phone,
      
      warehouseName: saleDetail.warehouse.name,
      paymentMethod: saleDetail.payment?.name ?? null,
      username: saleDetail.user?.username ?? null,
      
      orderNumber: saleDetail.order.number,
      
      items: items,
      
      subtotal: saleDetail.totals.saleTotal,
      total: saleDetail.totals.saleTotal,
      advances: saleDetail.totals.totalAdvances,
      balance: saleDetail.totals.balance,
      itemCount: saleDetail.totals.itemCount
    };
  }

  private formatDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('es-BO', {
        timeZone: 'America/La_Paz',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  }
}