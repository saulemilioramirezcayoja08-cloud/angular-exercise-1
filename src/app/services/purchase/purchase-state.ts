import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {EditablePurchaseProduct} from '../../models/purchase.models';

export interface SelectedProduct {
  id: number;
  sku: string;
  name: string;
  uom: string;
  price: number;
}

export interface SupplierData {
  id: number;
  taxId: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface PurchaseStateData {
  products: EditablePurchaseProduct[];
  notes: string;
  supplier: SupplierData | null;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseState {
   private readonly STORAGE_KEY = 'purchase_state';
  private products: EditablePurchaseProduct[] = [];
  private notes: string = '';
  private supplier: SupplierData | null = null;
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
        const data: PurchaseStateData = JSON.parse(stored);
        this.products = data.products || [];
        this.notes = data.notes || '';
        this.supplier = data.supplier || null;
      }
    } catch (error) {
      this.products = [];
      this.notes = '';
      this.supplier = null;
    }
  }

  private saveToStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const data: PurchaseStateData = {
        products: this.products,
        notes: this.notes,
        supplier: this.supplier
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

    const editableProduct: EditablePurchaseProduct = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      uom: product.uom,
      quantity: 1,
      price: product.price,
      notes: ''
    };

    this.products.push(editableProduct);
    this.saveToStorage();
    return true;
  }

  getProducts(): EditablePurchaseProduct[] {
    return [...this.products];
  }

  updateProducts(updatedProducts: EditablePurchaseProduct[]): void {
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

  getSupplier(): SupplierData | null {
    return this.supplier;
  }

  setSupplier(supplier: SupplierData): void {
    this.supplier = supplier;
    this.saveToStorage();
  }

  clearSupplier(): void {
    this.supplier = null;
    this.saveToStorage();
  }

  clearProducts(): void {
    this.products = [];
    this.notes = '';
    this.supplier = null;
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}