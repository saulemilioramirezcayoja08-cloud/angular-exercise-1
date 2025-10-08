import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductData } from '../../services/product/models/product-search-response.model';
import { ProductService } from '../../services/product/product-service';
import { ProductSearchEvent } from '../../models/product.models';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { NavigationService } from '../../services/navigation-service';
import { QuotationState } from '../../services/quotation/quotation-state';
import { OrderState } from '../../services/order/order-state';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.html',
  styleUrl: './product.css'
})
export class Product implements OnInit, OnDestroy {
  searchResults = signal<ProductData[]>([]);
  isSearching = signal<boolean>(false);
  errorMessage = signal<string>('');

  private searchSubject = new Subject<ProductSearchEvent>();
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private productService: ProductService,
    private navigationService: NavigationService,
    private quotationState: QuotationState,
    private orderState: OrderState
  ) { }

  ngOnInit(): void {
    this.setupSearchPipeline();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.goBack();
    }
  }

  private setupSearchPipeline(): void {
    this.searchSubject.pipe(
      tap(() => {
        this.isSearching.set(true);
        this.errorMessage.set('');
      }),
      debounceTime(300),
      distinctUntilChanged((prev, curr) =>
        prev.query.trim() === curr.query.trim() &&
        prev.searchType === curr.searchType
      ),
      switchMap(event =>
        this.executeSearch(event).pipe(
          catchError(error => {
            console.error('Error en la búsqueda:', error);
            const errorMsg = this.getErrorMessage(error);
            this.errorMessage.set(errorMsg);
            return of({ success: false, data: null, message: errorMsg });
          })
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.searchResults.set(response.success && response.data ? response.data : []);
        this.isSearching.set(false);
      },
      error: (error) => {
        console.error('Error inesperado:', error);
        this.isSearching.set(false);
        this.errorMessage.set('Error inesperado en la búsqueda');
      }
    });
  }

  onSearchRequested(event: ProductSearchEvent): void {
    const query = event.query.trim();

    if (!query || query.length < 2) {
      this.errorMessage.set('Ingresa al menos 2 caracteres para buscar');
      return;
    }

    this.searchSubject.next(event);
  }

  onSearchCleared(): void {
    this.searchResults.set([]);
    this.isSearching.set(false);
    this.errorMessage.set('');
  }

  onProductSelected(product: ProductData): void {
    const selectedProduct = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      uom: product.uom,
      price: product.price
    };

    const returnUrl = this.navigationService.getReturnUrl();
    let added = false;
    let context = '';

    if (returnUrl === '/order') {
      added = this.orderState.addProduct(selectedProduct);
      context = 'orden';
    } else {
      added = this.quotationState.addProduct(selectedProduct);
      context = 'cotización';
    }

    if (!added) {
      alert(`El producto "${product.name}" ya está en la ${context}`);
    }

    this.goBack();
  }

  goBack(): void {
    this.navigationService.navigateBack(this.router);
  }

  private executeSearch(event: ProductSearchEvent) {
    const searchText = event.query.trim();
    const searchType = event.searchType;

    if (searchType === 'all') {
      const parts = searchText.split('-').map(p => p.trim());

      if (parts.length === 2 && parts[0] && parts[1]) {
        return this.productService.searchBySkuAndName(parts[0], parts[1]);
      } else {
        return this.productService.searchByName(searchText);
      }
    }

    if (searchType === 'name') {
      return this.productService.searchByName(searchText);
    }

    if (searchType === 'sku') {
      return this.productService.searchBySku(searchText);
    }

    return this.productService.searchByName(searchText);
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'No se puede conectar con el servidor';
    }

    if (error.status === 404) {
      return 'No se encontraron productos';
    }

    if (error.status >= 500) {
      return 'Error en el servidor. Intenta nuevamente';
    }

    return 'Error al buscar productos';
  }
}