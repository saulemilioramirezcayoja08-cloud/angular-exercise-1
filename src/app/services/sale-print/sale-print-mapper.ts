import { Injectable } from '@angular/core';
import { SaleDetailData } from '../sale/models/detail/sale-detail-response.model';
import { SalePrintData, SalePrintItem } from './models/sale-print-data.model';
import {SalePrintService} from './sale-print.service';

@Injectable({
  providedIn: 'root'
})
export class SalePrintMapper {

  constructor(private salePrintService: SalePrintService) { }

  transformToPrintData(saleDetail: SaleDetailData): SalePrintData {
    const items: SalePrintItem[] = saleDetail.details.map((detail, index) => ({
      itemNumber: (index + 1).toString(),
      productName: detail.productName,
      sku: detail.productSku,
      uom: detail.uom,
      quantity: detail.quantity,
      price: detail.price,
      subtotal: detail.subtotal,
      notes: detail.notes
    }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const amountInWords = this.salePrintService.numberToWords(saleDetail.totals.saleTotal);

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
      totalQuantity: totalQuantity,
      advances: saleDetail.totals.totalAdvances,
      balance: saleDetail.totals.balance,
      itemCount: saleDetail.totals.itemCount,
      amountInWords: amountInWords
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
