import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PurchaseSearchData} from '../../../../services/purchase/models/search/purchase-search-response.model';

type SearchType = 'number' | 'username' | 'status' | 'dateRange' | null;

export interface PurchaseAction {
  purchaseId: number;
  purchaseNumber: string;
  action: 'confirm' | 'cancel';
}

@Component({
  selector: 'app-list-middle-purchase',
  standalone: false,
  templateUrl: './list-middle-purchase.html',
  styleUrl: './list-middle-purchase.css'
})
export class ListMiddlePurchase {
  @Input() purchases: PurchaseSearchData[] = [];
  @Input() isLoading: boolean = false;
  @Input() hasSearched: boolean = false;
  @Input() searchType: SearchType = null;

  @Output() purchaseSelected = new EventEmitter<number>();
  @Output() purchaseActionRequested = new EventEmitter<PurchaseAction>();

  private openMenuPurchaseId: number | null = null;

  onRowClick(purchaseId: number): void {
    this.purchaseSelected.emit(purchaseId);
  }

  onConfirmClick(purchase: PurchaseSearchData): void {
    this.purchaseActionRequested.emit({
      purchaseId: purchase.id,
      purchaseNumber: purchase.number,
      action: 'confirm'
    });
  }

  onCancelClick(purchase: PurchaseSearchData): void {
    this.purchaseActionRequested.emit({
      purchaseId: purchase.id,
      purchaseNumber: purchase.number,
      action: 'cancel'
    });
  }

  toggleMenu(purchaseId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.openMenuPurchaseId === purchaseId) {
      this.openMenuPurchaseId = null;
    } else {
      this.openMenuPurchaseId = purchaseId;
    }
  }

  isMenuOpen(purchaseId: number): boolean {
    return this.openMenuPurchaseId === purchaseId;
  }

  hasOpenMenu(): boolean {
    return this.openMenuPurchaseId !== null;
  }

  closeMenu(): void {
    this.openMenuPurchaseId = null;
  }

  closeMenuOnClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions')) {
      this.closeMenu();
    }
  }

  getEmptyMessage(): { title: string, subtitle: string } {
    if (!this.hasSearched) {
      return {
        title: 'No hay compras para mostrar',
        subtitle: 'Selecciona un criterio de búsqueda y presiona "Buscar"'
      };
    }

    switch (this.searchType) {
      case 'number':
        return {
          title: 'No se encontraron compras',
          subtitle: 'Intenta con otro número de compra'
        };
      case 'username':
        return {
          title: 'No se encontraron compras',
          subtitle: 'Intenta con otro nombre de usuario'
        };
      case 'status':
        return {
          title: 'No se encontraron compras',
          subtitle: 'No hay compras con este estado'
        };
      case 'dateRange':
        return {
          title: 'No se encontraron compras',
          subtitle: 'Intenta con otro rango de fechas'
        };
      default:
        return {
          title: 'No se encontraron compras',
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

  trackByPurchaseId(_index: number, purchase: PurchaseSearchData): number {
    return purchase.id;
  }
}
