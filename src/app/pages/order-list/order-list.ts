import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {OrderSearchData, PaginationMetadata} from '../../services/order/models/search/order-search-response.model';
import {SearchEvent} from './components/list-top-order/list-top-order';
import {delay, finalize, Subject, takeUntil} from 'rxjs';
import {OrderService} from '../../services/order/order-service';

@Component({
  selector: 'app-order-list',
  standalone: false,
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderList implements OnInit, OnDestroy {
  orders = signal<OrderSearchData[]>([]);
  pagination = signal<PaginationMetadata | null>(null);

  currentSearchEvent = signal<SearchEvent | null>(null);
  searchType = signal<'number' | 'username' | 'status' | 'dateRange' | null>(null);
  currentPage = signal<number>(0);
  currentSize = signal<number>(5);

  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  private searchSubject$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(private orderService: OrderService) { }

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
    this.orders.set([]);
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

  onOrderSelected(orderId: number): void {
    console.log('Order selected:', orderId);
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
        searchObservable = this.orderService.searchByNumber(searchEvent.query, page, size);
        break;

      case 'username':
        if (!searchEvent.query) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.orderService.searchByUsername(searchEvent.query, page, size);
        break;

      case 'status':
        if (!searchEvent.status) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.orderService.searchByStatus(searchEvent.status, page, size);
        break;

      case 'dateRange':
        if (!searchEvent.dateFrom || !searchEvent.dateTo) {
          this.isLoading.set(false);
          return;
        }
        const isoDateFrom = this.toISO8601(searchEvent.dateFrom, false);
        const isoDateTo = this.toISO8601(searchEvent.dateTo, true);
        searchObservable = this.orderService.searchByDateRange(isoDateFrom, isoDateTo, page, size);
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
            this.orders.set(response.data || []);
            this.pagination.set(response.pagination);
          } else {
            this.showError(response.message);
            this.orders.set([]);
            this.pagination.set(null);
          }
        },
        error: (error) => {
          console.error('Error searching orders:', error);

          const message = error.error?.message
            || (error.status === 0 ? 'No se puede conectar con el servidor'
              : error.status === 400 ? 'Parámetros de búsqueda inválidos'
                : error.status === 404 ? 'No se encontraron resultados'
                  : error.status === 500 ? 'Error interno del servidor'
                    : 'Error al buscar órdenes');

          this.showError(message);
          this.orders.set([]);
          this.pagination.set(null);
        }
      });
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

  private showError(message: string): void {
    alert(message);
  }
}
