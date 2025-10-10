import { Component, EventEmitter, Output, signal } from '@angular/core';
import { ProductSearchEvent } from '../../../../models/product.models';

type SearchType = 'name' | 'sku' | 'all';

@Component({
  selector: 'app-left-top',
  standalone: false,
  templateUrl: './left-top.html',
  styleUrl: './left-top.css'
})
export class LeftTop {
  @Output() searchRequested = new EventEmitter<ProductSearchEvent>();
  @Output() searchCleared = new EventEmitter<void>();

  searchQuery = signal<string>('');
  searchType = signal<SearchType>('all');

  onSearchEnter(): void {
    const query = this.searchQuery().trim();

    if (!query || query.length < 2) {
      return;
    }

    this.searchRequested.emit({
      query: query,
      searchType: this.searchType()
    });
  }

  onQueryChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchCleared.emit();
  }

  changeSearchType(type: 'name' | 'sku'): void {
    this.searchType.set(type);

    if (this.searchQuery()) {
      this.searchCleared.emit();
    }
  }

  toggleSearchAll(): void {
    if (this.searchType() === 'all') {
      this.searchType.set('name');
    } else {
      this.searchType.set('all');
    }

    if (this.searchQuery()) {
      this.searchCleared.emit();
    }
  }

  getPlaceholder(): string {
    const type = this.searchType();

    if (type === 'all') {
      return 'Buscar por código - nombre (ej: ABC-123 - Producto) y presiona Enter';
    }

    if (type === 'name') {
      return 'Buscar por nombre... (Enter para buscar)';
    }

    if (type === 'sku') {
      return 'Buscar por código... (Enter para buscar)';
    }

    return 'Buscar productos... (Enter)';
  }
}