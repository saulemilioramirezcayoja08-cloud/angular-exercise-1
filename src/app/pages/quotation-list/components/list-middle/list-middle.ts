import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QuotationSearchData} from '../../../../services/quotation/models/search/quotation-search-response.model';

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

  @Output() quotationSelected = new EventEmitter<number>();

  onRowClick(quotationId: number): void {
    this.quotationSelected.emit(quotationId);
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

  formatCurrency(amount: number, currency: string): string {
    const currencySymbol = this.getCurrencySymbol(currency);
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace(/^/, `${currencySymbol} `);
  }

  formatDate(isoDate: string): string {
    if (!isoDate) {
      return '';
    }
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  trackByQuotationId(_index: number, quotation: QuotationSearchData): number {
    return quotation.id;
  }

  private getCurrencySymbol(currency: string): string {
    switch (currency?.toUpperCase()) {
      case 'BOB':
        return 'Bs';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return currency || '';
    }
  }
}
