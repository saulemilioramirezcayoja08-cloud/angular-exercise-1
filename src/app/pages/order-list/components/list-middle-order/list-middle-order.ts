import {Component, EventEmitter, Input, Output} from '@angular/core';
import {OrderSearchData} from '../../../../services/order/models/search/order-search-response.model';

type SearchType = 'number' | 'username' | 'status' | 'dateRange' | null;

export interface OrderAction {
  orderId: number;
  orderNumber: string;
  action: 'confirm' | 'cancel';
}

@Component({
  selector: 'app-list-middle-order',
  standalone: false,
  templateUrl: './list-middle-order.html',
  styleUrl: './list-middle-order.css'
})
export class ListMiddleOrder {
  @Input() orders: OrderSearchData[] = [];
  @Input() isLoading: boolean = false;
  @Input() hasSearched: boolean = false;
  @Input() searchType: SearchType = null;

  @Output() orderSelected = new EventEmitter<number>();
  @Output() orderActionRequested = new EventEmitter<OrderAction>();

  onRowClick(orderId: number): void {
    this.orderSelected.emit(orderId);
  }

  onConfirmClick(order: OrderSearchData): void {
    this.orderActionRequested.emit({
      orderId: order.id,
      orderNumber: order.number,
      action: 'confirm'
    });
  }

  onCancelClick(order: OrderSearchData): void {
    this.orderActionRequested.emit({
      orderId: order.id,
      orderNumber: order.number,
      action: 'cancel'
    });
  }

  getEmptyMessage(): { title: string, subtitle: string } {
    if (!this.hasSearched) {
      return {
        title: 'No hay órdenes para mostrar',
        subtitle: 'Selecciona un criterio de búsqueda y presiona "Buscar"'
      };
    }

    switch (this.searchType) {
      case 'number':
        return {
          title: 'No se encontraron órdenes',
          subtitle: 'Intenta con otro número de orden'
        };
      case 'username':
        return {
          title: 'No se encontraron órdenes',
          subtitle: 'Intenta con otro nombre de usuario'
        };
      case 'status':
        return {
          title: 'No se encontraron órdenes',
          subtitle: 'No hay órdenes con este estado'
        };
      case 'dateRange':
        return {
          title: 'No se encontraron órdenes',
          subtitle: 'Intenta con otro rango de fechas'
        };
      default:
        return {
          title: 'No se encontraron órdenes',
          subtitle: 'Intenta con otros criterios de búsqueda'
        };
    }
  }

  getBadgeClass(status: string): string {
    const baseClass = 'badge';
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return `${baseClass} draft`;
      case 'CONFIRMED':
        return `${baseClass} confirmed`;
      case 'CANCELED':
        return `${baseClass} canceled`;
      default:
        return baseClass;
    }
  }

  formatDateTime(isoDate: string): string {
    if (!isoDate) {
      return '';
    }

    try {
      const date = new Date(isoDate);
      return date.toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  trackByOrderId(_index: number, order: OrderSearchData): number {
    return order.id;
  }
}
