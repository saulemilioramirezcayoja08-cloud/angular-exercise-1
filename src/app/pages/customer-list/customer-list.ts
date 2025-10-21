import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CustomerListItem, PaginationInfo } from '../../services/customer/models/customer-page-response.model';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';
import { CustomerService } from '../../services/customer/customer-service';

@Component({
  selector: 'app-customer-list',
  standalone: false,
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerList implements OnInit, OnDestroy {
   customers = signal<CustomerListItem[]>([]);
  pagination = signal<PaginationInfo | null>(null);
  isLoading = signal<boolean>(false);
  
  searchControl = new FormControl('');
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  sortBy = signal<string>('name');
  sortDir = signal<string>('asc');
  
  private destroy$ = new Subject<void>();

  Math = Math;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
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
          this.searchCustomers(searchTerm.trim());
        } else {
          this.loadCustomers();
        }
      });
  }

  private loadCustomers(): void {
    if (this.isLoading()) return;
    
    this.isLoading.set(true);
    
    this.customerService
      .getAll(this.currentPage(), this.pageSize(), this.sortBy(), this.sortDir())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.customers.set(response.data.content);
            this.pagination.set(response.data.pagination);
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          console.error('Error loading customers:', error);
          alert('Error al cargar los clientes');
        }
      });
  }

  private searchCustomers(name: string): void {
    if (this.isLoading()) return;
    
    this.isLoading.set(true);
    
    this.customerService
      .searchByName(name, this.currentPage(), this.pageSize(), this.sortBy(), this.sortDir())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.customers.set(response.data.content);
            this.pagination.set(response.data.pagination);
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          console.error('Error searching customers:', error);
          alert('Error al buscar clientes');
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    const searchTerm = this.searchControl.value;
    if (searchTerm && searchTerm.trim().length > 0) {
      this.searchCustomers(searchTerm.trim());
    } else {
      this.loadCustomers();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    const searchTerm = this.searchControl.value;
    if (searchTerm && searchTerm.trim().length > 0) {
      this.searchCustomers(searchTerm.trim());
    } else {
      this.loadCustomers();
    }
  }

  onSort(field: string): void {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.loadCustomers();
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
}