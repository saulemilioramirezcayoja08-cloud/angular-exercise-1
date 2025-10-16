import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {PurchaseSearchData} from '../../services/purchase/models/search/purchase-search-response.model';
import {PaginationMetadata} from '../../services/sale/models/search/sale-search-response.model';
import {SearchEvent} from '../quotation-list/components/list-top/list-top';
import {delay, finalize, Subject, takeUntil} from 'rxjs';
import {PurchaseService} from '../../services/purchase/purchase-service';
import {AuthService} from '../../services/auth/auth-service';
import {PurchaseConfirmRequest} from '../../services/purchase/models/confirm/purchase-confirm-request.model';
import {PurchaseCancelRequest} from '../../services/purchase/models/cancel/purchase-cancel-request.model';
import {PurchaseAction} from './components/list-middle-purchase/list-middle-purchase';

@Component({
  selector: 'app-purchase-list',
  standalone: false,
  templateUrl: './purchase-list.html',
  styleUrl: './purchase-list.css'
})
export class PurchaseList implements OnInit, OnDestroy {
  purchases = signal<PurchaseSearchData[]>([]);
  pagination = signal<PaginationMetadata | null>(null);

  currentSearchEvent = signal<SearchEvent | null>(null);
  searchType = signal<'number' | 'username' | 'status' | 'dateRange' | null>(null);
  currentPage = signal<number>(0);
  currentSize = signal<number>(5);

  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  private searchSubject$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.searchSubject$.next();
    this.searchSubject$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchRequested(event: SearchEvent): void {
    this.currentSearchEvent.set(event);
    this.searchType.set(event.type);
    this.currentPage.set(0);
    this.performSearch();
  }

  onSearchCleared(): void {
    this.purchases.set([]);
    this.pagination.set(null);
    this.hasSearched.set(false);
    this.currentSearchEvent.set(null);
    this.searchType.set(null);
  }

  onPageChanged(page: number): void {
    this.currentPage.set(page);
    this.performSearch();
  }

  onSizeChanged(size: number): void {
    this.currentSize.set(size);
    this.currentPage.set(0);
    this.performSearch();
  }

  onGoToFirstPage(): void {
    this.currentPage.set(0);
    this.performSearch();
  }

  onGoToLastPage(): void {
    const pag = this.pagination();
    if (pag && pag.totalPages > 0) {
      this.currentPage.set(pag.totalPages - 1);
      this.performSearch();
    }
  }

  onPurchaseSelected(purchaseId: number): void {
    console.log('Purchase selected:', purchaseId);
  }

  onPurchaseAction(action: PurchaseAction): void {
    if (action.action === 'confirm') {
      this.handleConfirmPurchase(action.purchaseId, action.purchaseNumber);
    } else if (action.action === 'cancel') {
      this.handleCancelPurchase(action.purchaseId, action.purchaseNumber);
    }
  }

  private handleConfirmPurchase(purchaseId: number, purchaseNumber: string): void {
    const purchase = this.purchases().find(p => p.id === purchaseId);

    if (!purchase) {
      this.showError('Compra no encontrada');
      return;
    }

    if (purchase.status !== 'DRAFT') {
      this.showError(
        `No se puede confirmar la compra #${purchaseNumber}\n\n` +
        `Estado actual: ${purchase.status}\n` +
        `Estado requerido: DRAFT\n\n` +
        `Las compras solo pueden confirmarse cuando están en estado BORRADOR.`
      );
      return;
    }

    const confirmed = confirm(
      `¿Confirmar la compra #${purchaseNumber}?\n\n` +
      `RESUMEN:\n` +
      `═══════════════════════════════\n` +
      `Proveedor:  ${purchase.supplierName}\n` +
      `Almacén:    ${purchase.warehouseName}\n` +
      `Total:      ${this.formatCurrency(purchase.totalAmount)}\n` +
      `Items:      ${purchase.itemCount}\n` +
      `═══════════════════════════════\n\n` +
      `Esta acción:\n` +
      `• Aumentará el stock de productos\n` +
      `• Cambiará el estado a CONFIRMADO\n` +
      `• No podrá revertirse\n\n` +
      `¿Deseas continuar?`
    );

    if (!confirmed) {
      return;
    }

    const notes = prompt('Notas de confirmación (opcional):');

    if (notes === null) {
      return;
    }

    this.confirmPurchase(purchaseId, notes);
  }

  private confirmPurchase(purchaseId: number, notes: string): void {
    this.setPurchaseProcessing(purchaseId, true);

    const request: PurchaseConfirmRequest = {
      confirmNotes: notes || '',
      userId: this.getCurrentUserId()
    };

    this.purchaseService.confirmPurchase(purchaseId, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setPurchaseProcessing(purchaseId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(`Compra #${response.data?.number} confirmada exitosamente`);
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al confirmar compra:', error);
          this.handleApiError(error, 'confirmar');
        }
      });
  }

  private handleCancelPurchase(purchaseId: number, purchaseNumber: string): void {
    const purchase = this.purchases().find(p => p.id === purchaseId);

    if (!purchase) {
      this.showError('Compra no encontrada');
      return;
    }

    if (purchase.status !== 'DRAFT') {
      this.showError(
        `No se puede cancelar la compra #${purchaseNumber}\n\n` +
        `Estado actual: ${purchase.status}\n` +
        `Estado requerido: DRAFT\n\n` +
        `Las compras solo pueden cancelarse cuando están en estado BORRADOR.`
      );
      return;
    }

    const notes = prompt(
      `Cancelar la compra #${purchaseNumber}\n\n` +
      `Esta acción:\n` +
      `• Cambiará el estado a CANCELADO\n` +
      `• No afectará el stock de productos\n` +
      `• No podrá revertirse\n\n` +
      `Escribe el motivo de cancelación:`
    );

    if (notes === null) {
      return;
    }

    if (!notes.trim()) {
      this.showError('Debes especificar un motivo para cancelar la compra');
      return;
    }

    const confirmed = confirm(
      `¿CONFIRMAR CANCELACIÓN?\n\n` +
      `Compra: #${purchaseNumber}\n` +
      `Motivo: "${notes}"\n\n` +
      `ADVERTENCIA:\n` +
      `• Esta acción NO puede revertirse\n` +
      `• El stock NO se verá afectado\n\n` +
      `¿Proceder con la cancelación?`
    );

    if (!confirmed) {
      return;
    }

    this.cancelPurchase(purchaseId, notes);
  }

  private cancelPurchase(purchaseId: number, notes: string): void {
    this.setPurchaseProcessing(purchaseId, true);

    const request: PurchaseCancelRequest = {
      cancelNotes: notes,
      userId: this.getCurrentUserId()
    };

    this.purchaseService.cancelPurchase(purchaseId, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setPurchaseProcessing(purchaseId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(`Compra #${response.data?.number} cancelada exitosamente`);
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al cancelar compra:', error);
          this.handleApiError(error, 'cancelar');
        }
      });
  }

  private performSearch(): void {
    const searchEvent = this.currentSearchEvent();
    if (!searchEvent) {
      return;
    }

    this.searchSubject$.next();

    const page = this.currentPage();
    const size = this.currentSize();

    this.isLoading.set(true);
    this.hasSearched.set(true);

    let searchObservable;

    switch (searchEvent.type) {
      case 'number':
        if (!searchEvent.query) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.purchaseService.searchByNumber(searchEvent.query, page, size);
        break;

      case 'username':
        if (!searchEvent.query) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.purchaseService.searchByUsername(searchEvent.query, page, size);
        break;

      case 'status':
        if (!searchEvent.status) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.purchaseService.searchByStatus(searchEvent.status, page, size);
        break;

      case 'dateRange':
        if (!searchEvent.dateFrom || !searchEvent.dateTo) {
          this.isLoading.set(false);
          return;
        }
        const isoDateFrom = this.toISO8601(searchEvent.dateFrom, false);
        const isoDateTo = this.toISO8601(searchEvent.dateTo, true);
        searchObservable = this.purchaseService.searchByDateRange(isoDateFrom, isoDateTo, page, size);
        break;

      default:
        this.isLoading.set(false);
        return;
    }

    searchObservable
      .pipe(
        delay(800),
        takeUntil(this.searchSubject$),
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            const purchasesWithProcessing = (response.data || []).map(purchase => ({
              ...purchase,
              isProcessing: false
            }));
            this.purchases.set(purchasesWithProcessing);
            this.pagination.set(response.pagination);
          } else {
            this.showError(response.message);
            this.purchases.set([]);
            this.pagination.set(null);
          }
        },
        error: (error) => {
          console.error('Error searching purchases:', error);
          this.handleSearchError(error);
          this.purchases.set([]);
          this.pagination.set(null);
        }
      });
  }

  private setPurchaseProcessing(purchaseId: number, isProcessing: boolean): void {
    const currentPurchases = this.purchases();
    const updatedPurchases = currentPurchases.map(purchase =>
      purchase.id === purchaseId
        ? {...purchase, isProcessing}
        : purchase
    );
    this.purchases.set(updatedPurchases);
  }

  private getCurrentUserId(): number {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.userId) {
      return currentUser.userId;
    }
    console.warn('No se pudo obtener el userId del usuario actual, usando fallback');
    return 1;
  }

  private toISO8601(dateString: string, isEndOfDay: boolean = false): string {
    if (!dateString) {
      return '';
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (isEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date.toISOString();
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  }

  private handleApiError(error: any, action: string): void {
    let message = `Error al ${action} la compra`;

    if (error.status === 404) {
      message = `${error.error?.message || 'Compra no encontrada'}\n\n` +
        `La compra solicitada no existe en el sistema.`;
    } else if (error.status === 409) {
      const baseMessage = error.error?.message || 'La compra no puede ser modificada en su estado actual';
      message = `${baseMessage}\n\n` +
        `Verifique el estado de la compra e intente nuevamente.`;
    } else if (error.status === 0) {
      message = 'No se puede conectar con el servidor\n\n' +
        'Por favor, verifique su conexión a internet e intente nuevamente.';
    } else if (error.error?.message) {
      message = `${error.error.message}`;
    }

    this.showError(message);
  }

  private handleSearchError(error: any): void {
    let message: string;

    if (error.status === 0) {
      message = 'No se puede conectar con el servidor\n\n' +
        'Por favor, verifique su conexión a internet.';
    } else if (error.status === 400) {
      message = 'Parámetros de búsqueda inválidos\n\n' +
        'Verifique los criterios de búsqueda e intente nuevamente.';
    } else if (error.status === 404) {
      message = 'No se encontraron resultados\n\n' +
        'Intente con otros criterios de búsqueda.';
    } else if (error.status === 500) {
      message = 'Error interno del servidor\n\n' +
        'Por favor, contacte al administrador del sistema.';
    } else if (error.error?.message) {
      message = `${error.error.message}`;
    } else {
      message = 'Error al buscar compras\n\n' +
        'Intente nuevamente más tarde.';
    }

    this.showError(message);
  }

  private showSuccess(message: string): void {
    alert(message);
  }

  private showError(message: string): void {
    alert(message);
  }
}
