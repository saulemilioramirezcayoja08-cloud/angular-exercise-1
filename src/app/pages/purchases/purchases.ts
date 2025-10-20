import {Component, computed, HostListener, OnDestroy, OnInit, signal} from '@angular/core';
import {
  EditablePurchaseProduct,
  PurchaseMetadata,
  PurchaseTotals,
  NotesUpdateEvent,
  ProductUpdateEvent
} from '../../models/purchase.models';
import {finalize, Subject, takeUntil} from 'rxjs';
import {Router} from '@angular/router';
import {PurchaseState, SupplierData} from '../../services/purchase/purchase-state';
import {PurchaseService} from '../../services/purchase/purchase-service';
import {NavigationService} from '../../services/navigation-service';
import {AuthService} from '../../services/auth/auth-service';
import {PurchaseCreateRequest} from '../../services/purchase/models/create/purchase-create-request.model';
import { SupplierService } from '../../services/supplier/supplier-service';

@Component({
  selector: 'app-purchases',
  standalone: false,
  templateUrl: './purchases.html',
  styleUrl: './purchases.css'
})
export class Purchases implements OnInit, OnDestroy {
  products = signal<EditablePurchaseProduct[]>([]);
  purchaseNotes = signal<string>('');
  supplier = signal<SupplierData | null>(null);
  isGenerating = signal<boolean>(false);

  totals = computed<PurchaseTotals>(() => {
    return this.calculateTotals(this.products());
  });

  private readonly metadata: PurchaseMetadata = {
    supplierId: 1,
    warehouseId: 1,
    currency: 'BOB',
    userId: 1,
    paymentId: 1
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private purchaseState: PurchaseState,
    private purchaseService: PurchaseService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private supplierService: SupplierService
  ) {
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadSupplier();
    this.loadUserId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      this.addSupplier();
    }

    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      this.navigateToProducts();
    }

    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      this.clearPurchase();
    }

    if (event.ctrlKey && event.key === 'g') {
      event.preventDefault();
      this.onGeneratePurchase();
    }
  }

  addSupplier(): void {
    const supplierId = prompt('Ingrese el ID del proveedor:');

    if (!supplierId || supplierId.trim() === '') {
      return;
    }

    const id = parseInt(supplierId);

    if (isNaN(id) || id <= 0) {
      alert('ID de proveedor inválido');
      return;
    }

    this.supplierService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const supplierData: SupplierData = {
              id: response.data.id,
              taxId: response.data.taxId,
              name: response.data.name,
              phone: response.data.phone,
              email: response.data.email,
              address: response.data.address
            };

            this.supplier.set(supplierData);
            this.purchaseState.setSupplier(supplierData);
            this.metadata.supplierId = supplierData.id;

            alert(`Proveedor "${supplierData.name}" agregado correctamente`);
          } else {
            alert(response.message || 'Proveedor no encontrado');
          }
        },
        error: (error) => {
          console.error('Error loading supplier:', error);
          alert('Error al cargar el proveedor');
        }
      });
  }

  onProductsChanged(event: ProductUpdateEvent): void {
    this.products.set(event.products);
    this.purchaseState.updateProducts(event.products);
  }

  onNotesChanged(event: NotesUpdateEvent): void {
    this.purchaseNotes.set(event.notes);
    this.purchaseState.updateNotes(event.notes);
  }

  onGeneratePurchase(): void {
    const currentProducts = this.products();

    if (currentProducts.length === 0) {
      alert('No hay productos en la compra');
      return;
    }

    if (!this.supplier()) {
      alert('Debe agregar un proveedor antes de generar la compra (Ctrl + S)');
      return;
    }

    const paymentIdStr = prompt('Ingrese el ID del método de pago:');

    if (!paymentIdStr || paymentIdStr.trim() === '') {
      alert('Debe ingresar un ID de método de pago');
      return;
    }

    const paymentId = parseInt(paymentIdStr);

    if (isNaN(paymentId) || paymentId <= 0) {
      alert('ID de método de pago inválido');
      return;
    }

    this.metadata.paymentId = paymentId;

    const confirmGenerate = confirm('¿Está seguro que desea generar la compra?');

    if (!confirmGenerate) {
      return;
    }

    if (this.isGenerating()) {
      return;
    }

    this.isGenerating.set(true);

    const payload = this.buildBackendPayload();

    this.purchaseService.create(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isGenerating.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            alert(`Compra creada exitosamente. Número: ${response.data.number}`);

            setTimeout(() => {
              this.products.set([]);
              this.purchaseNotes.set('');
              this.supplier.set(null);
              this.purchaseState.clearProducts();
            }, 100);
          } else {
            alert(response.message || 'Error al crear la compra');
          }
        },
        error: (error) => {
          console.error('Error creating purchase:', error);

          if (error.error?.message) {
            alert(error.error.message);
          } else if (error.status === 0) {
            alert('No se puede conectar con el servidor');
          } else {
            alert('Error de conexión con el servidor');
          }
        }
      });
  }

  clearPurchase(): void {
    if (this.products().length === 0 && !this.purchaseNotes() && !this.supplier()) {
      return;
    }

    const confirmClear = confirm('¿Está seguro de limpiar la compra?');

    if (!confirmClear) {
      return;
    }

    this.products.set([]);
    this.purchaseNotes.set('');
    this.supplier.set(null);
    this.purchaseState.clearProducts();
  }

  navigateToProducts(): void {
    this.navigationService.setReturnUrl('/purchase');
    this.router.navigate(['/product']);
  }

  private loadProducts(): void {
    const loadedProducts = this.purchaseState.getProducts();
    const loadedNotes = this.purchaseState.getNotes();

    this.products.set(loadedProducts);
    this.purchaseNotes.set(loadedNotes);
  }

  private loadSupplier(): void {
    const loadedSupplier = this.purchaseState.getSupplier();
    
    if (loadedSupplier) {
      this.supplier.set(loadedSupplier);
      this.metadata.supplierId = loadedSupplier.id;
    }
  }

  private loadUserId(): void {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.userId) {
      this.metadata.userId = currentUser.userId;
    } else {
      alert('Sesión expirada. Por favor inicie sesión nuevamente.');
      this.router.navigate(['/login']);
    }
  }

  private calculateTotals(products: EditablePurchaseProduct[]): PurchaseTotals {
    let subtotal = 0;

    for (const product of products) {
      const productTotal = product.quantity * product.price;
      subtotal += productTotal;
    }

    return {
      subtotal: subtotal,
      grandTotal: subtotal
    };
  }

  private buildBackendPayload(): PurchaseCreateRequest {
    const details = this.products()
      .filter(p => p.quantity > 0 && p.price >= 0)
      .map(product => ({
        productId: product.id,
        quantity: product.quantity,
        price: product.price,
        notes: product.notes || ''
      }));

    if (details.length === 0) {
      throw new Error('No hay productos válidos para enviar');
    }

    return {
      supplierId: this.metadata.supplierId,
      warehouseId: this.metadata.warehouseId,
      currency: this.metadata.currency,
      userId: this.metadata.userId,
      paymentId: this.metadata.paymentId,
      notes: this.purchaseNotes(),
      details: details
    };
  }
}