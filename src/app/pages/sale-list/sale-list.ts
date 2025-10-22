import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { PaginationMetadata, SaleSearchData } from '../../services/sale/models/search/sale-search-response.model';
import { SearchEvent } from './components/list-top-sale/list-top-sale';
import { delay, finalize, Subject, takeUntil } from 'rxjs';
import { SaleService } from '../../services/sale/sale-service';
import { SaleAction } from './components/list-middle-sale/list-middle-sale';
import { SaleConfirmRequest } from '../../services/sale/models/confirm/sale-confirm-request.model';
import { SaleCancelRequest } from '../../services/sale/models/cancel/sale-cancel-request.model';
import { OrderService } from '../../services/order/order-service';
import { Router } from '@angular/router';
import { SalePrintService } from '../../services/sale-print/sale-print.service';
import { SalePrintMapper } from '../../services/sale-print/sale-print-mapper';

@Component({
  selector: 'app-sale-list',
  standalone: false,
  templateUrl: './sale-list.html',
  styleUrl: './sale-list.css'
})
export class SaleList implements OnInit, OnDestroy {
  sales = signal<SaleSearchData[]>([]);
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
    private saleService: SaleService,
    private orderService: OrderService,
    private router: Router,
    private salePrintService: SalePrintService,
    private salePrintMapper: SalePrintMapper
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
    this.sales.set([]);
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

  onSaleSelected(saleId: number): void {
    console.log('Sale selected:', saleId);
  }

  onSaleAction(action: SaleAction): void {
    if (action.action === 'confirm') {
      this.handleConfirmSale(action.saleId, action.saleNumber);
    } else if (action.action === 'cancel') {
      this.handleCancelSale(action.saleId, action.saleNumber);
    } else if (action.action === 'advance') {
      this.handleCreateAdvance(
        action.orderId,
        action.saleNumber,
        action.saleTotalAmount || 0,
        action.orderTotalAdvances || 0
      );
    } else if (action.action === 'print') {
      this.handlePrintSale(action.saleId);
    }
  }

  private handlePrintSale(saleId: number): void {
    this.setSaleProcessing(saleId, true);

    this.saleService.getSaleById(saleId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setSaleProcessing(saleId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const printData = this.salePrintMapper.transformToPrintData(response.data);

            this.salePrintService.setPrintData(printData);

            this.router.navigate(['/sale/print'], {
              queryParams: { mode: 'generate' }
            });
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al obtener venta para imprimir:', error);
          this.handlePrintError(error);
        }
      });
  }

  private handleConfirmSale(saleId: number, saleNumber: string): void {
    const sale = this.sales().find(s => s.id === saleId);

    if (!sale) {
      this.showError('Venta no encontrada');
      return;
    }

    if (sale.status !== 'DRAFT') {
      this.showError('Solo las ventas en estado DRAFT pueden ser confirmadas');
      return;
    }

    const confirmed = confirm(
      `¿Confirmar la venta #${saleNumber}?\n\n` +
      `Esta acción:\n` +
      `• Reducirá el stock del almacén\n` +
      `• Consumirá las reservaciones de la orden\n` +
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

    this.confirmSale(saleId, notes);
  }

  private confirmSale(saleId: number, notes: string): void {
    this.setSaleProcessing(saleId, true);

    const request: SaleConfirmRequest = {
      confirmNotes: notes || '',
      userId: this.getCurrentUserId()
    };

    this.saleService.confirmSale(saleId, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setSaleProcessing(saleId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(`Venta #${response.data?.number} confirmada exitosamente`);
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al confirmar venta:', error);
          this.handleApiError(error, 'confirmar');
        }
      });
  }

  private handleCancelSale(saleId: number, saleNumber: string): void {
    const sale = this.sales().find(s => s.id === saleId);

    if (!sale) {
      this.showError('Venta no encontrada');
      return;
    }

    if (sale.status !== 'DRAFT') {
      this.showError('Solo las ventas en estado DRAFT pueden ser canceladas');
      return;
    }

    const notes = prompt(
      `¿Cancelar la venta #${saleNumber}?\n\n` +
      `Esta acción:\n` +
      `• Cancelará las reservaciones de la orden\n` +
      `• Cambiará el estado a CANCELADO\n` +
      `• No podrá revertirse\n\n` +
      `Escribe el motivo de cancelación:`
    );

    if (notes === null) {
      return;
    }

    if (!notes.trim()) {
      this.showError('Debes especificar un motivo para cancelar la venta');
      return;
    }

    this.cancelSale(saleId, notes);
  }

  private cancelSale(saleId: number, notes: string): void {
    this.setSaleProcessing(saleId, true);

    const request: SaleCancelRequest = {
      cancelNotes: notes,
      userId: this.getCurrentUserId()
    };

    this.saleService.cancelSale(saleId, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setSaleProcessing(saleId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(`Venta #${response.data?.number} cancelada exitosamente`);
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al cancelar venta:', error);
          this.handleApiError(error, 'cancelar');
        }
      });
  }

  private handleCreateAdvance(
    orderId: number,
    saleNumber: string,
    saleTotalAmount: number,
    orderTotalAdvances: number
  ): void {
    const availableAmount = saleTotalAmount - orderTotalAdvances;

    if (availableAmount <= 0) {
      this.showError('El total de anticipos ya cubre el monto total de la venta');
      return;
    }

    const amountStr = prompt(
      `Registrar anticipo para la venta #${saleNumber}\n\n` +
      `Total de la venta: ${saleTotalAmount.toFixed(2)}\n` +
      `Anticipos registrados: ${orderTotalAdvances.toFixed(2)}\n` +
      `Saldo disponible: ${availableAmount.toFixed(2)}\n\n` +
      `Ingresa el monto del anticipo:`
    );

    if (amountStr === null) {
      return;
    }

    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      this.showError('El monto debe ser un número positivo');
      return;
    }

    if (amount > availableAmount) {
      this.showError(
        `El monto del anticipo (${amount.toFixed(2)}) excede el saldo disponible (${availableAmount.toFixed(2)})`
      );
      return;
    }

    this.createAdvance(orderId, amount, saleNumber);
  }

  private createAdvance(orderId: number, amount: number, saleNumber: string): void {
    this.orderService.createAdvanceForOrder(orderId, amount, this.getCurrentUserId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(
              `Anticipo de ${amount.toFixed(2)} registrado exitosamente para la venta #${saleNumber}`
            );
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al crear anticipo:', error);
          this.handleAdvanceError(error);
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
        searchObservable = this.saleService.searchByNumber(searchEvent.query, page, size);
        break;

      case 'username':
        if (!searchEvent.query) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.saleService.searchByUsername(searchEvent.query, page, size);
        break;

      case 'status':
        if (!searchEvent.status) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.saleService.searchByStatus(searchEvent.status, page, size);
        break;

      case 'dateRange':
        if (!searchEvent.dateFrom || !searchEvent.dateTo) {
          this.isLoading.set(false);
          return;
        }
        const isoDateFrom = this.toISO8601(searchEvent.dateFrom, false);
        const isoDateTo = this.toISO8601(searchEvent.dateTo, true);
        searchObservable = this.saleService.searchByDateRange(isoDateFrom, isoDateTo, page, size);
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
            const salesWithProcessing = (response.data || []).map(sale => ({
              ...sale,
              isProcessing: false
            }));
            this.sales.set(salesWithProcessing);
            this.pagination.set(response.pagination);
          } else {
            this.showError(response.message);
            this.sales.set([]);
            this.pagination.set(null);
          }
        },
        error: (error) => {
          console.error('Error searching sales:', error);
          this.handleSearchError(error);
          this.sales.set([]);
          this.pagination.set(null);
        }
      });
  }

  private setSaleProcessing(saleId: number, isProcessing: boolean): void {
    const currentSales = this.sales();
    const updatedSales = currentSales.map(sale =>
      sale.id === saleId
        ? { ...sale, isProcessing }
        : sale
    );
    this.sales.set(updatedSales);
  }

  private getCurrentUserId(): number {
    return 1;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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

  private handleApiError(error: any, action: string): void {
    let message = `Error al ${action} la venta`;

    if (error.status === 404) {
      message = error.error?.message || 'Venta no encontrada';
    } else if (error.status === 409) {
      message = error.error?.message || 'La venta no puede ser modificada en su estado actual';
    } else if (error.status === 0) {
      message = 'No se puede conectar con el servidor';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.showError(message);
  }

  private handleAdvanceError(error: any): void {
    let message = 'Error al crear el anticipo';

    if (error.status === 404) {
      message = error.error?.message || 'Orden no encontrada';
    } else if (error.status === 409) {
      message = error.error?.message || 'El monto del anticipo excede el total de la orden';
    } else if (error.status === 0) {
      message = 'No se puede conectar con el servidor';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.showError(message);
  }

  private handlePrintError(error: any): void {
    let message = 'Error al obtener los datos para imprimir';

    if (error.status === 404) {
      message = error.error?.message || 'Venta no encontrada';
    } else if (error.status === 0) {
      message = 'No se puede conectar con el servidor';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.showError(message);
  }

  private handleSearchError(error: any): void {
    const message = error.error?.message
      || (error.status === 0 ? 'No se puede conectar con el servidor'
        : error.status === 400 ? 'Parámetros de búsqueda inválidos'
          : error.status === 404 ? 'No se encontraron resultados'
            : error.status === 500 ? 'Error interno del servidor'
              : 'Error al buscar ventas');

    this.showError(message);
  }

  private showSuccess(message: string): void {
    alert(message);
  }

  private showError(message: string): void {
    alert(`${message}`);
  }
}