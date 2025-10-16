import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {EditablePurchaseProduct, ProductUpdateEvent} from '../../../../models/purchase.models';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-middle-purchase',
  standalone: false,
  templateUrl: './middle-purchase.html',
  styleUrl: './middle-purchase.css'
})
export class MiddlePurchase implements OnDestroy {
  @Input() products: EditablePurchaseProduct[] = [];
  @Output() productsChanged = new EventEmitter<ProductUpdateEvent>();

  private notesSubject = new Subject<{ index: number; notes: string }>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.notesSubject.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => prev.index === curr.index && prev.notes === curr.notes),
      takeUntil(this.destroy$)
    ).subscribe(({index, notes}) => {
      this.updateProductNotes(index, notes);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatItemNumber(index: number): string {
    const itemNumber = index + 1;
    return itemNumber < 10 ? '0' + itemNumber : itemNumber.toString();
  }

  calculateSubtotal(product: EditablePurchaseProduct): number {
    return product.quantity * product.price;
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
      input.value = this.products[index].quantity.toString();
      return;
    }

    this.updateProduct(index, {quantity: newQuantity});
  }

  onPriceChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newPrice = parseFloat(input.value);

    if (isNaN(newPrice) || newPrice < 0) {
      input.value = this.products[index].price.toString();
      return;
    }

    this.updateProduct(index, {price: newPrice});
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
    updatedProducts.splice(index, 1);

    this.emitProductsChanged(updatedProducts);
  }

  trackByProductId(_index: number, product: EditablePurchaseProduct): number {
    return product.id;
  }

  private updateProduct(index: number, changes: Partial<EditablePurchaseProduct>): void {
    const updatedProducts = [...this.products];
    const product = updatedProducts[index];

    updatedProducts[index] = {...product, ...changes};

    this.emitProductsChanged(updatedProducts);
  }

  private updateProductNotes(index: number, notes: string): void {
    const updatedProducts = [...this.products];
    updatedProducts[index] = {...updatedProducts[index], notes};

    this.emitProductsChanged(updatedProducts);
  }

  private emitProductsChanged(products: EditablePurchaseProduct[]): void {
    this.productsChanged.emit({products});
  }
}
