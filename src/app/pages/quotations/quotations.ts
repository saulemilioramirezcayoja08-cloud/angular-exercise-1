import { Component, computed, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuotationService } from '../../services/quotation/quotation-service';
import { DraftQuotationRequest } from '../../services/quotation/models/draft/draft-request.model';
import {
  EditableProduct,
  NotesUpdateEvent,
  ProductUpdateEvent,
  QuotationMetadata,
  QuotationTotals
} from '../../models/state.models';
import { QuotationState } from '../../services/quotation/quotation-state';
import { finalize, Subject, takeUntil } from 'rxjs';
import { NavigationService } from '../../services/navigation-service';
import { AuthService } from '../../services/auth/auth-service';
import { QuotationPrintService } from '../../services/quotation-print/quotation-print-service';

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
    private authService: AuthService,
    private quotationPrintService: QuotationPrintService
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

    if (event.ctrlKey && event.key === 'v') {
      event.preventDefault();
      this.onPreviewQuotation();
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

    const confirmGenerate = confirm('¿Está seguro que desea generar la cotización?');

    if (!confirmGenerate) {
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
          if (response.success && response.data) {
            const quotationNumber = response.data.number;

            const printData = this.preparePrintData(quotationNumber);
            this.quotationPrintService.setPrintData(printData);

            this.router.navigate(['/quotation/print'], {
              queryParams: { mode: 'generate' }
            });

            setTimeout(() => {
              this.products.set([]);
              this.quotationNotes.set('');
              this.quotationState.clearProducts();
            }, 100);
          } else {
            alert(response.message || 'Error al crear la cotización');
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

  onPreviewQuotation(): void {
    const currentProducts = this.products();

    if (currentProducts.length === 0) {
      alert('No hay productos en la cotización para previsualizar');
      return;
    }

    const printData = this.preparePrintData('PREVIEW');
    this.quotationPrintService.setPrintData(printData);

    this.router.navigate(['/quotation/print'], {
      queryParams: { mode: 'preview' }
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

  private preparePrintData(quotationNumber: string): any {
    const now = new Date();
    const currentUser = this.authService.getCurrentUser();

    const date = now.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const time = now.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const registrationDateTime = `${date} ${time}`;

    const printProducts = this.products().map((product, index) => {
      const subtotal = product.quantity * product.price;
      const discountAmount = (subtotal * product.discount) / 100;
      const total = subtotal - discountAmount;

      return {
        itemNumber: (index + 1).toString(),
        sku: product.sku,
        name: product.name,
        origin: 'OR',
        quantity: product.quantity,
        price: product.price,
        subtotal: subtotal,
        discountPercent: product.discount,
        discountAmount: discountAmount,
        total: total,
        uom: product.uom
      };
    });

    const totalQuantity = this.products().reduce((sum, p) => sum + p.quantity, 0);
    const totalsData = this.totals();
    const amountInWords = this.quotationPrintService.numberToWords(totalsData.grandTotal);

    return {
      quotationNumber: quotationNumber,
      date: date,
      time: time,
      customer: {
        name: 'Cliente General',
        address: 'N/A',
        phone: 'N/A'
      },
      seller: currentUser?.username || 'N/A',
      products: printProducts,
      totals: {
        totalQuantity: totalQuantity,
        subtotal: totalsData.subtotal,
        totalDiscount: totalsData.totalDiscount,
        grandTotal: totalsData.grandTotal,
        amountInWords: amountInWords
      },
      notes: this.quotationNotes() || 'N/A',
      registrationDateTime: registrationDateTime,
      username: currentUser?.username || 'N/A'
    };
  }
}