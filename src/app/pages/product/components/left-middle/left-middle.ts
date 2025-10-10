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

  @Output() productSelected = new EventEmitter<ProductData>();

  selectProduct(product: ProductData): void {
    this.productSelected.emit(product);
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
