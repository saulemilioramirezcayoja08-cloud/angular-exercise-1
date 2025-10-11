import {Component, computed, HostListener, OnDestroy, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {QuotationService} from '../../services/quotation/quotation-service';
import {DraftQuotationRequest} from '../../services/quotation/models/draft/draft-request.model';
import {
  EditableProduct,
  NotesUpdateEvent,
  ProductUpdateEvent,
  QuotationMetadata,
  QuotationTotals
} from '../../models/state.models';
import {QuotationState} from '../../services/quotation/quotation-state';
import {finalize, Subject, takeUntil} from 'rxjs';
import {NavigationService} from '../../services/navigation-service';
import {AuthService} from '../../services/auth/auth-service';

@Component({
  selector: 'app-quotation',
  standalone: false,
  templateUrl: './quotations.html',
  styleUrl: './quotations.css'
})
export class Quotations implements OnInit, OnDestroy {
  products = signal<EditableProduct[]>([]);
  quotationNotes = signal<string>('');
  isGenerating = signal<boolean>(false);

  totals = computed<QuotationTotals>(() => {
    return this.calculateTotals(this.products());
  });

  private readonly metadata: QuotationMetadata = {
    customerId: 1,
    warehouseId: 1,
    currency: 'BOB',
    userId: 1
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private quotationState: QuotationState,
    private quotationService: QuotationService,
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
      this.clearQuotation();
    }

    if (event.ctrlKey && event.key === 'g') {
      event.preventDefault();
      this.onGenerateQuotation();
    }
  }

  onProductsChanged(event: ProductUpdateEvent): void {
    this.products.set(event.products);
    this.quotationState.updateProducts(event.products);
  }

  onNotesChanged(event: NotesUpdateEvent): void {
    this.quotationNotes.set(event.notes);
    this.quotationState.updateNotes(event.notes);
  }

  onGenerateQuotation(): void {
    const currentProducts = this.products();

    if (currentProducts.length === 0) {
      alert('No hay productos en la cotización');
      return;
    }

    if (this.isGenerating()) {
      return;
    }

    this.isGenerating.set(true);

    const payload = this.buildBackendPayload();

    this.quotationService.createDraft(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isGenerating.set(false))
      )
      .subscribe({
        next: (response) => {
          alert(response.message);

          if (response.success) {
            this.products.set([]);
            this.quotationNotes.set('');
            this.quotationState.clearProducts();
          }
        },
        error: (error) => {
          console.error('Error creating quotation:', error);

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

  clearQuotation(): void {
    if (this.products().length === 0 && !this.quotationNotes()) {
      return;
    }

    const confirmClear = confirm('¿Está seguro de limpiar la cotización?');

    if (!confirmClear) {
      return;
    }

    this.products.set([]);
    this.quotationNotes.set('');
    this.quotationState.clearProducts();
  }

  navigateToProducts(): void {
    this.navigationService.setReturnUrl('/quotation');
    this.router.navigate(['/product']);
  }

  private loadProducts(): void {
    const loadedProducts = this.quotationState.getProducts();
    const loadedNotes = this.quotationState.getNotes();

    this.products.set(loadedProducts);
    this.quotationNotes.set(loadedNotes);
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

  private buildBackendPayload(): DraftQuotationRequest {
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
      notes: this.quotationNotes(),
      details: details
    };
  }
}
