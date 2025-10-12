import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {
  PaginationMetadata,
  QuotationSearchData
} from '../../services/quotation/models/search/quotation-search-response.model';
import {delay, finalize, Subject, takeUntil} from 'rxjs';
import {QuotationService} from '../../services/quotation/quotation-service';
import {SearchEvent} from './components/list-top/list-top';
import {QuotationAction} from './components/list-middle/list-middle';
import {QuotationConfirmRequest} from '../../services/quotation/models/confirm/quotation-confirm-request.model';
import {QuotationCancelRequest} from '../../services/quotation/models/cancel/quotation-cancel-request.model';

@Component({
  selector: 'app-quotation-list',
  standalone: false,
  templateUrl: './quotation-list.html',
  styleUrl: './quotation-list.css'
})
export class QuotationList implements OnInit, OnDestroy {
  quotations = signal<QuotationSearchData[]>([]);
  pagination = signal<PaginationMetadata | null>(null);

  currentSearchEvent = signal<SearchEvent | null>(null);
  searchType = signal<'number' | 'username' | 'status' | 'dateRange' | null>(null);
  currentPage = signal<number>(0);
  currentSize = signal<number>(5);

  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  private searchSubject$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(private quotationService: QuotationService) {
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
    this.quotations.set([]);
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

  onQuotationSelected(quotationId: number): void {
    console.log('Quotation selected:', quotationId);
  }

  onQuotationAction(action: QuotationAction): void {
    if (action.action === 'confirm') {
      this.handleConfirmQuotation(action.quotationId, action.quotationNumber);
    } else if (action.action === 'cancel') {
      this.handleCancelQuotation(action.quotationId, action.quotationNumber);
    }
  }

  private handleConfirmQuotation(quotationId: number, quotationNumber: string): void {
    const quotation = this.quotations().find(q => q.id === quotationId);

    if (!quotation) {
      this.showError('Cotización no encontrada');
      return;
    }

    if (quotation.status !== 'DRAFT') {
      this.showError('Solo las cotizaciones en estado DRAFT pueden ser confirmadas');
      return;
    }

    const confirmed = confirm(
      `¿Confirmar la cotización #${quotationNumber}?\n\n` +
      `Esta acción:\n` +
      `• Creará una orden asociada\n` +
      `• Creará reservaciones de productos\n` +
      `• Cambiará el estado a CONFIRMADO\n` +
      `• No podrá revertirse\n\n` +
      `¿Deseas continuar?`
    );

    if (!confirmed) {
      return;
    }

    const paymentIdStr = prompt(
      'ID del método de pago (opcional - dejar vacío para omitir):'
    );

    if (paymentIdStr === null) {
      return;
    }

    const notes = prompt('Notas de confirmación (opcional):');

    if (notes === null) {
      return;
    }

    const paymentId = paymentIdStr && paymentIdStr.trim()
      ? parseInt(paymentIdStr.trim(), 10)
      : undefined;

    if (paymentIdStr && paymentIdStr.trim() && (isNaN(paymentId!) || paymentId! <= 0)) {
      this.showError('El ID del método de pago debe ser un número válido');
      return;
    }

    this.confirmQuotation(quotationId, paymentId, notes);
  }

  private confirmQuotation(quotationId: number, paymentId: number | undefined, notes: string): void {
    this.setQuotationProcessing(quotationId, true);

    const request: QuotationConfirmRequest = {
      confirmNotes: notes || '',
      userId: this.getCurrentUserId()
    };

    if (paymentId !== undefined) {
      (request as any).paymentId = paymentId;
    }

    this.quotationService.confirmQuotation(quotationId, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setQuotationProcessing(quotationId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(`Cotización #${response.data?.number} confirmada exitosamente`);
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al confirmar cotización:', error);
          this.handleApiError(error, 'confirmar');
        }
      });
  }

  private handleCancelQuotation(quotationId: number, quotationNumber: string): void {
    const quotation = this.quotations().find(q => q.id === quotationId);

    if (!quotation) {
      this.showError('Cotización no encontrada');
      return;
    }

    if (quotation.status !== 'DRAFT') {
      this.showError('Solo las cotizaciones en estado DRAFT pueden ser canceladas');
      return;
    }

    const notes = prompt(
      `¿Cancelar la cotización #${quotationNumber}?\n\n` +
      `Esta acción:\n` +
      `• Cambiará el estado a CANCELADO\n` +
      `• No podrá revertirse\n\n` +
      `Escribe el motivo de cancelación:`
    );

    if (notes === null) {
      return;
    }

    if (!notes.trim()) {
      this.showError('Debes especificar un motivo para cancelar la cotización');
      return;
    }

    this.cancelQuotation(quotationId, notes);
  }

  private cancelQuotation(quotationId: number, notes: string): void {
    this.setQuotationProcessing(quotationId, true);

    const request: QuotationCancelRequest = {
      cancelNotes: notes,
      userId: this.getCurrentUserId()
    };

    this.quotationService.cancelQuotation(quotationId, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setQuotationProcessing(quotationId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(`Cotización #${response.data?.number} cancelada exitosamente`);
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al cancelar cotización:', error);
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
        searchObservable = this.quotationService.searchByNumber(searchEvent.query, page, size);
        break;

      case 'username':
        if (!searchEvent.query) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.quotationService.searchByUsername(searchEvent.query, page, size);
        break;

      case 'status':
        if (!searchEvent.status) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.quotationService.searchByStatus(searchEvent.status, page, size);
        break;

      case 'dateRange':
        if (!searchEvent.dateFrom || !searchEvent.dateTo) {
          this.isLoading.set(false);
          return;
        }
        const isoDateFrom = this.toISO8601(searchEvent.dateFrom, false);
        const isoDateTo = this.toISO8601(searchEvent.dateTo, true);
        searchObservable = this.quotationService.searchByDateRange(isoDateFrom, isoDateTo, page, size);
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
            const quotationsWithProcessing = (response.data || []).map(quotation => ({
              ...quotation,
              isProcessing: false
            }));
            this.quotations.set(quotationsWithProcessing);
            this.pagination.set(response.pagination);
          } else {
            this.showError(response.message);
            this.quotations.set([]);
            this.pagination.set(null);
          }
        },
        error: (error) => {
          console.error('Error searching quotations:', error);
          this.handleSearchError(error);
          this.quotations.set([]);
          this.pagination.set(null);
        }
      });
  }

  private setQuotationProcessing(quotationId: number, isProcessing: boolean): void {
    const currentQuotations = this.quotations();
    const updatedQuotations = currentQuotations.map(quotation =>
      quotation.id === quotationId
        ? {...quotation, isProcessing}
        : quotation
    );
    this.quotations.set(updatedQuotations);
  }

  private getCurrentUserId(): number {
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

  private handleApiError(error: any, action: string): void {
    let message = `Error al ${action} la cotización`;

    if (error.status === 404) {
      message = error.error?.message || 'Cotización no encontrada';
    } else if (error.status === 409) {
      message = error.error?.message || 'La cotización no puede ser modificada en su estado actual';
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
              : 'Error al buscar cotizaciones');

    this.showError(message);
  }

  private showSuccess(message: string): void {
    alert(message);
  }

  private showError(message: string): void {
    alert(`✗ ${message}`);
  }
}
