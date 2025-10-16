import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductData } from '../../services/product/models/product-search-response.model';
import { ProductService } from '../../services/product/product-service';
import { NavigationService } from '../../services/navigation-service';
import { QuotationState } from '../../services/quotation/quotation-state';
import { OrderState } from '../../services/order/order-state';
import { delay, finalize, Subject, takeUntil } from 'rxjs';
import { ProductSearchEvent } from './components/left-top/left-top';
import { PurchaseState } from '../../services/purchase/purchase-state';

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
  hasSearched = signal<boolean>(false);
  selectedProductId = signal<number | null>(null);

  private currentSearchEvent = signal<ProductSearchEvent | null>(null);
  private searchSubject$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private productService: ProductService,
    private navigationService: NavigationService,
    private quotationState: QuotationState,
    private orderState: OrderState,
    private purchaseState: PurchaseState
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

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    if (event.key === 'Escape') {
      this.goBack();
    }
  }

  onSearchRequested(event: ProductSearchEvent): void {
    const query = event.query.trim();

    if (!query || query.length < 2) {
      this.errorMessage.set('Ingresa al menos 2 caracteres para buscar');
      return;
    }

    this.currentSearchEvent.set(event);
    this.performSearch();
  }

  onSearchCleared(): void {
    this.searchResults.set([]);
    this.isSearching.set(false);
    this.errorMessage.set('');
    this.hasSearched.set(false);
    this.currentSearchEvent.set(null);
    this.selectedProductId.set(null);
  }

  onProductClicked(product: ProductData): void {
    this.selectedProductId.set(product.id);
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
    let added: boolean;
    let context: string;

    if (returnUrl === '/order') {
      added = this.orderState.addProduct(selectedProduct);
      context = 'orden';
    } else if (returnUrl === '/purchase') {
      added = this.purchaseState.addProduct(selectedProduct);
      context = 'compra';
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

  private performSearch(): void {
    const event = this.currentSearchEvent();
    if (!event) {
      return;
    }

    this.searchSubject$.next();

    this.isSearching.set(true);
    this.hasSearched.set(true);
    this.errorMessage.set('');
    this.selectedProductId.set(null);

    this.executeSearch(event).pipe(
      delay(800),
      takeUntil(this.searchSubject$),
      takeUntil(this.destroy$),
      finalize(() => this.isSearching.set(false))
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.searchResults.set(response.data);
        } else {
          this.searchResults.set([]);
          this.errorMessage.set(response.message || 'No se encontraron productos');
        }
      },
      error: (error) => {
        const errorMsg = this.getErrorMessage(error);
        this.errorMessage.set(errorMsg);
        this.searchResults.set([]);
      }
    });
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