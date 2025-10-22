import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SaleSearchData} from '../../../../services/sale/models/search/sale-search-response.model';

type SearchType = 'number' | 'username' | 'status' | 'dateRange' | null;

export interface SaleAction {
  saleId: number;
  saleNumber: string;
  orderId: number;
  action: 'confirm' | 'cancel' | 'advance' | 'print';
  saleTotalAmount?: number;
  orderTotalAdvances?: number;
}

@Component({
  selector: 'app-list-middle-sale',
  standalone: false,
  templateUrl: './list-middle-sale.html',
  styleUrl: './list-middle-sale.css'
})
export class ListMiddleSale {
   @Input() sales: SaleSearchData[] = [];
  @Input() isLoading: boolean = false;
  @Input() hasSearched: boolean = false;
  @Input() searchType: SearchType = null;

  @Output() saleSelected = new EventEmitter<number>();
  @Output() saleActionRequested = new EventEmitter<SaleAction>();

  onRowClick(saleId: number): void {
    this.saleSelected.emit(saleId);
  }

  onConfirmClick(sale: SaleSearchData): void {
    this.saleActionRequested.emit({
      saleId: sale.id,
      saleNumber: sale.number,
      orderId: sale.orderId,
      action: 'confirm'
    });
  }

  onCancelClick(sale: SaleSearchData): void {
    this.saleActionRequested.emit({
      saleId: sale.id,
      saleNumber: sale.number,
      orderId: sale.orderId,
      action: 'cancel'
    });
  }

  onAdvanceClick(sale: SaleSearchData): void {
    this.saleActionRequested.emit({
      saleId: sale.id,
      saleNumber: sale.number,
      orderId: sale.orderId,
      action: 'advance',
      saleTotalAmount: sale.saleTotalAmount,
      orderTotalAdvances: sale.orderTotalAdvances
    });
  }

  onPrintClick(sale: SaleSearchData): void {
    this.saleActionRequested.emit({
      saleId: sale.id,
      saleNumber: sale.number,
      orderId: sale.orderId,
      action: 'print'
    });
  }

  getEmptyMessage(): { title: string, subtitle: string } {
    if (!this.hasSearched) {
      return {
        title: 'No hay ventas para mostrar',
        subtitle: 'Selecciona un criterio de búsqueda y presiona "Buscar"'
      };
    }

    switch (this.searchType) {
      case 'number':
        return {
          title: 'No se encontraron ventas',
          subtitle: 'Intenta con otro número de venta'
        };
      case 'username':
        return {
          title: 'No se encontraron ventas',
          subtitle: 'Intenta con otro nombre de usuario'
        };
      case 'status':
        return {
          title: 'No se encontraron ventas',
          subtitle: 'No hay ventas con este estado'
        };
      case 'dateRange':
        return {
          title: 'No se encontraron ventas',
          subtitle: 'Intenta con otro rango de fechas'
        };
      default:
        return {
          title: 'No se encontraron ventas',
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

  trackBySaleId(_index: number, sale: SaleSearchData): number {
    return sale.id;
  }
}