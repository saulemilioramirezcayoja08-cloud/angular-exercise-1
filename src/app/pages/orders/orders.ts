import {Component, computed, HostListener, OnDestroy, OnInit, signal} from '@angular/core';
import {EditableProduct, NotesUpdateEvent, ProductUpdateEvent, QuotationTotals} from '../../models/state.models';
import {finalize, Subject, takeUntil} from 'rxjs';
import {Router} from '@angular/router';
import {OrderState} from '../../services/order/order-state';
import {OrderService} from '../../services/order/order-service';
import {AuthService} from '../../services/auth/auth-service';
import {NavigationService} from '../../services/navigation-service';
import {DraftOrderRequest} from '../../services/order/models/draft/draft-request.model';
import {OrderMetadata} from '../../models/order.models';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit, OnDestroy {
  products = signal<EditableProduct[]>([]);
  orderNotes = signal<string>('');
  isGenerating = signal<boolean>(false);

  totals = computed<QuotationTotals>(() => {
    return this.calculateTotals(this.products());
  });

  private readonly metadata: OrderMetadata = {
    customerId: 1,
    warehouseId: 1,
    currency: 'BOB',
    userId: 1,
    paymentId: undefined,
    quotationId: undefined
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private orderState: OrderState,
    private orderService: OrderService,
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
      this.clearOrder();
    }

    if (event.ctrlKey && event.key === 'g') {
      event.preventDefault();
      this.onGenerateOrder();
    }
  }

  onProductsChanged(event: ProductUpdateEvent): void {
    this.products.set(event.products);
    this.orderState.updateProducts(event.products);
  }

  onNotesChanged(event: NotesUpdateEvent): void {
    this.orderNotes.set(event.notes);
    this.orderState.updateNotes(event.notes);
  }

  onGenerateOrder(): void {
    const currentProducts = this.products();

    if (currentProducts.length === 0) {
      alert('No hay productos en la orden');
      return;
    }

    if (this.isGenerating()) {
      return;
    }

    this.isGenerating.set(true);

    const payload = this.buildBackendPayload();

    this.orderService.createDraft(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isGenerating.set(false))
      )
      .subscribe({
        next: (response) => {
          alert(response.message);

          if (response.success) {
            this.products.set([]);
            this.orderNotes.set('');
            this.orderState.clearProducts();
          }
        },
        error: (error) => {
          console.error('Error creating order:', error);

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

  clearOrder(): void {
    if (this.products().length === 0 && !this.orderNotes()) {
      return;
    }

    const confirmClear = confirm('¿Está seguro de limpiar la orden?');

    if (!confirmClear) {
      return;
    }

    this.products.set([]);
    this.orderNotes.set('');
    this.orderState.clearProducts();
  }

  navigateToProducts(): void {
    this.navigationService.setReturnUrl('/order');
    this.router.navigate(['/product']);
  }

  private loadProducts(): void {
    const loadedProducts = this.orderState.getProducts();
    const loadedNotes = this.orderState.getNotes();

    this.products.set(loadedProducts);
    this.orderNotes.set(loadedNotes);
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

  private calculateTotals(products: EditableProduct[]): QuotationTotals {
    let subtotal = 0;
    let totalDiscount = 0;

    for (const product of products) {
      const productTotal = product.quantity * product.price;
      const productDiscount = (productTotal * product.discount) / 100;
      const productSubtotal = productTotal - productDiscount;

      subtotal += productSubtotal;
      totalDiscount += productDiscount;
    }

    return {
      subtotal: subtotal,
      totalDiscount: totalDiscount,
      grandTotal: subtotal
    };
  }

  private buildBackendPayload(): DraftOrderRequest {
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
      customerId: this.metadata.customerId,
      warehouseId: this.metadata.warehouseId,
      currency: this.metadata.currency,
      userId: this.metadata.userId,
      paymentId: this.metadata.paymentId,
      quotationId: this.metadata.quotationId,
      notes: this.orderNotes(),
      details: details
    };
  }
}
