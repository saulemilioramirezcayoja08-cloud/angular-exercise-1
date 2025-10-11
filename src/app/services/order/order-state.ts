import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EditableProduct } from '../../models/state.models';
import { isPlatformBrowser } from '@angular/common';

export interface SelectedProduct {
  id: number;
  sku: string;
  name: string;
  uom: string;
  price: number;
}

export interface OrderStateData {
  products: EditableProduct[];
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderState {
  private readonly STORAGE_KEY = 'order_state';
  private products: EditableProduct[] = [];
  private notes: string = '';
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data: OrderStateData = JSON.parse(stored);
        this.products = data.products || [];
        this.notes = data.notes || '';
      }
    } catch (error) {
      this.products = [];
      this.notes = '';
    }
  }

  private saveToStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const data: OrderStateData = {
        products: this.products,
        notes: this.notes
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  addProduct(product: SelectedProduct): boolean {
    const exists = this.products.some(p => p.id === product.id);

    if (exists) {
      return false;
    }

    const editableProduct: EditableProduct = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      uom: product.uom,
      quantity: 1,
      price: product.price,
      discount: 0,
      notes: ''
    };

    this.products.push(editableProduct);
    this.saveToStorage();
    return true;
  }

  getProducts(): EditableProduct[] {
    return [...this.products];
  }

  updateProducts(updatedProducts: EditableProduct[]): void {
    this.products = [...updatedProducts];
    this.saveToStorage();
  }

  getNotes(): string {
    return this.notes;
  }

  updateNotes(notes: string): void {
    this.notes = notes;
    this.saveToStorage();
  }

  clearProducts(): void {
    this.products = [];
    this.notes = '';
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
