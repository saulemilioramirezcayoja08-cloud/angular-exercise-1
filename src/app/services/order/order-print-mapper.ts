import { Injectable } from '@angular/core';
import { OrderPrintService } from '../order-print/order-print.service';
import { OrderPrintData, PrintProduct } from '../order-print/models/order-print-data.model';
import { OrderDetailData } from './models/detail/order-detail-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrderPrintMapper {


  constructor(private orderPrintService: OrderPrintService) { }

  transformToPrintData(orderDetail: OrderDetailData): OrderPrintData {
    const createdDate = new Date(orderDetail.createdAt);

    const date = createdDate.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const time = createdDate.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const registrationDateTime = createdDate.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const products: PrintProduct[] = orderDetail.details.map((detail, index) => ({
      itemNumber: (index + 1).toString(),
      sku: detail.productSku,
      name: detail.productName,
      origin: 'OR',
      quantity: detail.quantity,
      price: detail.price,
      total: detail.subtotal,
      uom: detail.uom
    }));

    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

    const amountInWords = this.orderPrintService.numberToWords(orderDetail.totals.orderTotal);

    return {
      orderNumber: orderDetail.number,
      date: date,
      time: time,
      customer: {
        name: orderDetail.customer.name,
        address: orderDetail.customer.address || 'N/A',
        phone: orderDetail.customer.phone || 'N/A'
      },
      seller: orderDetail.user?.username || 'N/A',
      products: products,
      totals: {
        totalQuantity: totalQuantity,
        subtotal: orderDetail.totals.orderTotal,
        grandTotal: orderDetail.totals.orderTotal,
        amountInWords: amountInWords
      },
      notes: orderDetail.notes || '',
      registrationDateTime: registrationDateTime,
      username: orderDetail.user?.username || 'N/A'
    };
  }
}