import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductData } from '../../../../services/product/models/product-search-response.model';

@Component({
  selector: 'app-left-middle',
  standalone: false,
  templateUrl: './left-middle.html',
  styleUrl: './left-middle.css'
})
export class LeftMiddle {
  @Input() products: ProductData[] = [];
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string = '';
  @Input() hasSearched: boolean = false;
  @Input() selectedProductId: number | null = null;

  @Output() productSelected = new EventEmitter<ProductData>();
  @Output() productClicked = new EventEmitter<ProductData>();

  selectProduct(event: Event, product: ProductData): void {
    event.stopPropagation();
    this.productSelected.emit(product);
  }

  onRowClick(product: ProductData): void {
    this.productClicked.emit(product);
  }

  isProductSelected(product: ProductData): boolean {
    return this.selectedProductId === product.id;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(price);
  }

  trackByProductId(_index: number, product: ProductData): number {
    return product.id;
  }
}