import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QuotationSearchData} from '../../../../services/quotation/models/search/quotation-search-response.model';

type SearchType = 'number' | 'username' | 'status' | 'dateRange' | null;

export interface QuotationAction {
  quotationId: number;
  quotationNumber: string;
  action: 'confirm' | 'cancel';
}

@Component({
  selector: 'app-list-middle',
  standalone: false,
  templateUrl: './list-middle.html',
  styleUrl: './list-middle.css'
})
export class ListMiddle {
  @Input() quotations: QuotationSearchData[] = [];
  @Input() isLoading: boolean = false;
  @Input() hasSearched: boolean = false;
  @Input() searchType: SearchType = null;

  @Output() quotationSelected = new EventEmitter<number>();
  @Output() quotationActionRequested = new EventEmitter<QuotationAction>();

  onRowClick(quotationId: number): void {
    this.quotationSelected.emit(quotationId);
  }

  onConfirmClick(quotation: QuotationSearchData): void {
    this.quotationActionRequested.emit({
      quotationId: quotation.id,
      quotationNumber: quotation.number,
      action: 'confirm'
    });
  }

  onCancelClick(quotation: QuotationSearchData): void {
    this.quotationActionRequested.emit({
      quotationId: quotation.id,
      quotationNumber: quotation.number,
      action: 'cancel'
    });
  }

  getEmptyMessage(): { title: string, subtitle: string } {
    if (!this.hasSearched) {
      return {
        title: 'No hay cotizaciones para mostrar',
        subtitle: 'Selecciona un criterio de búsqueda y presiona "Buscar"'
      };
    }

    switch (this.searchType) {
      case 'number':
        return {
          title: 'No se encontraron cotizaciones',
          subtitle: 'Intenta con otro número de cotización'
        };
      case 'username':
        return {
          title: 'No se encontraron cotizaciones',
          subtitle: 'Intenta con otro nombre de usuario'
        };
      case 'status':
        return {
          title: 'No se encontraron cotizaciones',
          subtitle: 'No hay cotizaciones con este estado'
        };
      case 'dateRange':
        return {
          title: 'No se encontraron cotizaciones',
          subtitle: 'Intenta con otro rango de fechas'
        };
      default:
        return {
          title: 'No se encontraron cotizaciones',
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

  trackByQuotationId(_index: number, quotation: QuotationSearchData): number {
    return quotation.id;
  }
}
