import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PaginationMetadata} from '../../../../services/sale/models/search/sale-search-response.model';

@Component({
  selector: 'app-list-bottom-purchase',
  standalone: false,
  templateUrl: './list-bottom-purchase.html',
  styleUrl: './list-bottom-purchase.css'
})
export class ListBottomPurchase {
  @Input() pagination: PaginationMetadata | null = null;
  @Input() isLoading: boolean = false;

  @Output() pageChanged = new EventEmitter<number>();
  @Output() sizeChanged = new EventEmitter<number>();
  @Output() goToFirstPage = new EventEmitter<void>();
  @Output() goToLastPage = new EventEmitter<void>();

  onFirstPage(): void {
    if (!this.canGoToFirstPage()) {
      return;
    }
    this.goToFirstPage.emit();
  }

  onPreviousPage(): void {
    if (!this.canGoToPrevious()) {
      return;
    }
    const currentPage = this.pagination?.currentPage || 0;
    this.pageChanged.emit(currentPage - 1);
  }

  onNextPage(): void {
    if (!this.canGoToNext()) {
      return;
    }
    const currentPage = this.pagination?.currentPage || 0;
    this.pageChanged.emit(currentPage + 1);
  }

  onLastPage(): void {
    if (!this.canGoToLastPage()) {
      return;
    }
    this.goToLastPage.emit();
  }

  onSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);

    if (!isNaN(newSize) && newSize >= 1 && newSize <= 100) {
      this.sizeChanged.emit(newSize);
    }
  }

  canGoToFirstPage(): boolean {
    return !this.isLoading && this.pagination !== null && this.pagination.hasPrevious;
  }

  canGoToPrevious(): boolean {
    return !this.isLoading && this.pagination !== null && this.pagination.hasPrevious;
  }

  canGoToNext(): boolean {
    return !this.isLoading && this.pagination !== null && this.pagination.hasNext;
  }

  canGoToLastPage(): boolean {
    return !this.isLoading && this.pagination !== null && this.pagination.hasNext;
  }

  getCurrentPage(): number {
    return (this.pagination?.currentPage ?? 0) + 1;
  }

  getTotalPages(): number {
    return this.pagination?.totalPages ?? 0;
  }

  getPageSize(): number {
    return this.pagination?.pageSize ?? 20;
  }

  getStartItem(): number {
    if (!this.pagination || this.pagination.totalElements === 0) {
      return 0;
    }
    return (this.pagination.currentPage * this.pagination.pageSize) + 1;
  }

  getEndItem(): number {
    if (!this.pagination || this.pagination.totalElements === 0) {
      return 0;
    }
    const end = (this.pagination.currentPage + 1) * this.pagination.pageSize;
    return Math.min(end, this.pagination.totalElements);
  }

  getTotalElements(): number {
    return this.pagination?.totalElements ?? 0;
  }
}
