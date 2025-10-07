import {Component, EventEmitter, Input, Output} from '@angular/core';
import {EditableProduct, ProductUpdateEvent} from '../../../../models/quotation.models';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';

interface ProductCalculation {
  subtotal: number;
  iva: number;
}

@Component({
  selector: 'app-middle',
  standalone: false,
  templateUrl: './middle.html',
  styleUrl: './middle.css'
})
export class Middle {
  @Input() products: EditableProduct[] = [];
  @Output() productsChanged = new EventEmitter<ProductUpdateEvent>();

  private calculationCache = new Map<number, number>();

  private notesSubject = new Subject<{ index: number; notes: string }>();

  constructor() {
    this.notesSubject.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => prev.index === curr.index && prev.notes === curr.notes)
    ).subscribe(({index, notes}) => {
      this.updateProductNotes(index, notes);
    });
  }

  formatItemNumber(index: number): string {
    const itemNumber = index + 1;
    return itemNumber < 10 ? '0' + itemNumber : itemNumber.toString();
  }

  calculateSubtotal(product: EditableProduct): number {
    const cached = this.calculationCache.get(product.id);

    if (cached !== undefined) {
      return cached;
    }

    const total = product.quantity * product.price;
    const discount = (total * product.discount) / 100;
    const subtotal = total - discount;

    this.calculationCache.set(product.id, subtotal);

    return subtotal;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  }

  onQuantityChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value);

    if (isNaN(newQuantity) || newQuantity < 1) {
      return;
    }

    this.updateProduct(index, {quantity: newQuantity});
  }

  onPriceChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newPrice = parseFloat(input.value);

    if (isNaN(newPrice) || newPrice < 0) {
      return;
    }

    this.updateProduct(index, {price: newPrice});
  }

  onDiscountChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newDiscount = parseFloat(input.value);

    if (isNaN(newDiscount) || newDiscount < 0 || newDiscount > 100) {
      return;
    }

    this.updateProduct(index, {discount: newDiscount});
  }

  onNotesInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newNotes = input.value;

    this.notesSubject.next({index, notes: newNotes});
  }

  deleteProduct(index: number): void {
    const productName = this.products[index].name;
    const confirmDelete = confirm(`¿Está seguro de eliminar el producto "${productName}"?`);

    if (!confirmDelete) {
      return;
    }

    const updatedProducts = [...this.products];
    const removedProduct = updatedProducts.splice(index, 1)[0];

    this.calculationCache.delete(removedProduct.id);

    this.emitProductsChanged(updatedProducts);
  }

  trackByProductId(index: number, product: EditableProduct): number {
    return product.id;
  }

  private updateProduct(index: number, changes: Partial<EditableProduct>): void {
    const updatedProducts = [...this.products];
    const product = updatedProducts[index];

    updatedProducts[index] = {...product, ...changes};

    this.calculationCache.delete(product.id);

    this.emitProductsChanged(updatedProducts);
  }

  private updateProductNotes(index: number, notes: string): void {
    const updatedProducts = [...this.products];
    updatedProducts[index] = {...updatedProducts[index], notes};

    this.emitProductsChanged(updatedProducts);
  }

  private emitProductsChanged(products: EditableProduct[]): void {
    this.productsChanged.emit({products});
  }
}
