import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {
  PaginationMetadata,
  QuotationSearchData
} from '../../services/quotation/models/search/quotation-search-response.model';
import {SearchCriteria} from '../../models/search.models';
import {finalize, Subject, takeUntil} from 'rxjs';
import {QuotationService} from '../../services/quotation/quotation-service';

@Component({
  selector: 'app-quotation-list',
  standalone: false,
  templateUrl: './quotation-list.html',
  styleUrl: './quotation-list.css'
})
export class QuotationList implements OnInit, OnDestroy {
  // Estado de resultados
  quotations = signal<QuotationSearchData[]>([]);
  pagination = signal<PaginationMetadata | null>(null);

  // Estado de búsqueda actual
  currentCriteria = signal<SearchCriteria | null>(null);
  currentPage = signal<number>(0);
  currentSize = signal<number>(20);

  // Estado de UI
  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  private destroy$ = new Subject<void>();

  constructor(private quotationService: QuotationService) {}

  ngOnInit(): void {
    // Puedes ejecutar una búsqueda inicial si lo deseas
    // this.performInitialSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchRequested(criteria: SearchCriteria): void {
    // Nueva búsqueda, resetear a página 0
    this.currentCriteria.set(criteria);
    this.currentPage.set(0);
    this.performSearch();
  }

  onPageChanged(page: number): void {
    this.currentPage.set(page);
    this.performSearch();
  }

  onSizeChanged(size: number): void {
    this.currentSize.set(size);
    this.currentPage.set(0); // Reset a primera página
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
    // Aquí puedes navegar a un detalle o abrir un modal
    console.log('Quotation selected:', quotationId);
    // this.router.navigate(['/quotation', quotationId]);
  }

  private performSearch(): void {
    const criteria = this.currentCriteria();

    if (!criteria) {
      return;
    }

    const page = this.currentPage();
    const size = this.currentSize();

    this.isLoading.set(true);
    this.hasSearched.set(true);

    let search$;

    switch (criteria.type) {
      case 'number':
        if (!criteria.query) {
          this.isLoading.set(false);
          return;
        }
        search$ = this.quotationService.searchByNumber(criteria.query, page, size);
        break;

      case 'status':
        if (!criteria.query) {
          this.isLoading.set(false);
          return;
        }
        search$ = this.quotationService.searchByStatus(criteria.query, page, size);
        break;

      case 'username':
        if (!criteria.query) {
          this.isLoading.set(false);
          return;
        }
        search$ = this.quotationService.searchByUsername(criteria.query, page, size);
        break;

      case 'dateRange':
        if (!criteria.dateFrom || !criteria.dateTo) {
          this.isLoading.set(false);
          return;
        }
        // Convertir a ISO-8601
        const isoDateFrom = this.toISO8601(criteria.dateFrom, false);
        const isoDateTo = this.toISO8601(criteria.dateTo, true);
        search$ = this.quotationService.searchByDateRange(isoDateFrom, isoDateTo, page, size);
        break;

      default:
        this.isLoading.set(false);
        return;
    }

    search$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.quotations.set(response.data || []);
            this.pagination.set(response.pagination);
          } else {
            // Mostrar mensaje de error del backend
            alert(response.message);
            this.quotations.set([]);
            this.pagination.set(null);
          }
        },
        error: (error) => {
          console.error('Error searching quotations:', error);

          // Mostrar mensaje del backend si existe
          if (error.error?.message) {
            alert(error.error.message);
          } else if (error.status === 0) {
            alert('No se puede conectar con el servidor');
          } else {
            alert('Error al buscar cotizaciones');
          }

          this.quotations.set([]);
          this.pagination.set(null);
        }
      });
  }
  private toISO8601(dateString: string, isEndOfDay: boolean = false): string {
    if (!dateString) {
      return '';
    }
    const time = isEndOfDay ? '23:59:59' : '00:00:00';
    return `${dateString}T${time}Z`;
  }
}
