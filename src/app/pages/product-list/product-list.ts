import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { PaginationInfo, ProductListItem } from '../../services/product/models/product-page-response.model';
import { FormControl } from '@angular/forms';
import { ProductService } from '../../services/product/product-service';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit, OnDestroy {
  products = signal<ProductListItem[]>([]);
  pagination = signal<PaginationInfo | null>(null);
  isLoading = signal<boolean>(false);

  searchControl = new FormControl('');
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  sortBy = signal<string>('name');
  sortDir = signal<string>('asc');

  private destroy$ = new Subject<void>();

  Math = Math;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.currentPage.set(0);
        if (searchTerm && searchTerm.trim().length > 0) {
          this.searchProducts(searchTerm.trim());
        } else {
          this.loadProducts();
        }
      });
  }

  private loadProducts(): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    this.productService
      .getAll(this.currentPage(), this.pageSize(), this.sortBy(), this.sortDir())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.products.set(response.data.content);
            this.pagination.set(response.data.pagination);
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          console.error('Error loading products:', error);
          alert('Error al cargar los productos');
        }
      });
  }

  private searchProducts(name: string): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    this.productService
      .searchByNamePaginated(name, this.currentPage(), this.pageSize(), this.sortBy(), this.sortDir())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.products.set(response.data.content);
            this.pagination.set(response.data.pagination);
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          console.error('Error searching products:', error);
          alert('Error al buscar productos');
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    const searchTerm = this.searchControl.value;
    if (searchTerm && searchTerm.trim().length > 0) {
      this.searchProducts(searchTerm.trim());
    } else {
      this.loadProducts();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    const searchTerm = this.searchControl.value;
    if (searchTerm && searchTerm.trim().length > 0) {
      this.searchProducts(searchTerm.trim());
    } else {
      this.loadProducts();
    }
  }

  onSort(field: string): void {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.loadProducts();
  }

  getPageNumbers(): number[] {
    const pag = this.pagination();
    if (!pag) return [];

    const pages: number[] = [];
    const maxVisible = 5;
    const totalPages = pag.totalPages;
    const current = pag.currentPage;

    let start = Math.max(0, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return pages;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(price);
  }
}