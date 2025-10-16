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
import {PurchaseState} from '../../services/purchase/purchase-state';
import {PurchaseService} from '../../services/purchase/purchase-service';
import {NavigationService} from '../../services/navigation-service';
import {AuthService} from '../../services/auth/auth-service';
import {PurchaseCreateRequest} from '../../services/purchase/models/create/purchase-create-request.model';

@Component({
  selector: 'app-purchases',
  standalone: false,
  templateUrl: './purchases.html',
  styleUrl: './purchases.css'
})
export class Purchases implements OnInit, OnDestroy {
  products = signal<EditablePurchaseProduct[]>([]);
  purchaseNotes = signal<string>('');
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
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.loadProducts();
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
    if (this.products().length === 0 && !this.purchaseNotes()) {
      return;
    }

    const confirmClear = confirm('¿Está seguro de limpiar la compra?');

    if (!confirmClear) {
      return;
    }

    this.products.set([]);
    this.purchaseNotes.set('');
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
