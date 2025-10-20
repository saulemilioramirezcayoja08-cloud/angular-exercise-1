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
import { CustomerData, QuotationState } from '../../services/quotation/quotation-state';
import { finalize, Subject, takeUntil } from 'rxjs';
import { NavigationService } from '../../services/navigation-service';
import { AuthService } from '../../services/auth/auth-service';
import { QuotationPrintService } from '../../services/quotation-print/quotation-print-service';
import { CustomerService } from '../../services/customer/customer-service';

@Component({
  selector: 'app-quotation',
  standalone: false,
  templateUrl: './quotations.html',
  styleUrl: './quotations.css'
})
export class Quotations implements OnInit, OnDestroy {
  products = signal<EditableProduct[]>([]);
  quotationNotes = signal<string>('');
  customer = signal<CustomerData | null>(null);
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
    private quotationPrintService: QuotationPrintService,
    private customerService: CustomerService
  ) {
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCustomer();
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

    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      this.addCustomer();
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

  addCustomer(): void {
    const customerId = prompt('Ingrese el ID del cliente:');

    if (!customerId || customerId.trim() === '') {
      return;
    }

    const id = parseInt(customerId);

    if (isNaN(id) || id <= 0) {
      alert('ID de cliente inválido');
      return;
    }

    this.customerService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const customerData: CustomerData = {
              id: response.data.id,
              taxId: response.data.taxId,
              name: response.data.name,
              phone: response.data.phone,
              email: response.data.email,
              address: response.data.address
            };

            this.customer.set(customerData);
            this.quotationState.setCustomer(customerData);
            this.metadata.customerId = customerData.id;

            alert(`Cliente "${customerData.name}" agregado correctamente`);
          } else {
            alert(response.message || 'Cliente no encontrado');
          }
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          alert('Error al cargar el cliente');
        }
      });
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

    if (!this.customer()) {
      alert('Debe agregar un cliente antes de generar la cotización (Ctrl + C)');
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
              this.customer.set(null);
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

    if (!this.customer()) {
      alert('Debe agregar un cliente antes de previsualizar (Ctrl + C)');
      return;
    }

    const printData = this.preparePrintData('PREVIEW');
    this.quotationPrintService.setPrintData(printData);

    this.router.navigate(['/quotation/print'], {
      queryParams: { mode: 'preview' }
    });
  }

  clearQuotation(): void {
    if (this.products().length === 0 && !this.quotationNotes() && !this.customer()) {
      return;
    }

    const confirmClear = confirm('¿Está seguro de limpiar la cotización?');

    if (!confirmClear) {
      return;
    }

    this.products.set([]);
    this.quotationNotes.set('');
    this.customer.set(null);
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

  private loadCustomer(): void {
    const loadedCustomer = this.quotationState.getCustomer();
    
    if (loadedCustomer) {
      this.customer.set(loadedCustomer);
      this.metadata.customerId = loadedCustomer.id;
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

  private calculateTotals(products: EditableProduct[]): QuotationTotals {
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
    const currentCustomer = this.customer();

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
      const total = product.quantity * product.price;

      return {
        itemNumber: (index + 1).toString(),
        sku: product.sku,
        name: product.name,
        origin: 'OR',
        quantity: product.quantity,
        price: product.price,
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
        name: currentCustomer?.name || 'N/A',
        address: currentCustomer?.address || 'N/A',
        phone: currentCustomer?.phone || 'N/A'
      },
      seller: currentUser?.username || 'N/A',
      products: printProducts,
      totals: {
        totalQuantity: totalQuantity,
        subtotal: totalsData.subtotal,
        grandTotal: totalsData.grandTotal,
        amountInWords: amountInWords
      },
      notes: this.quotationNotes() || 'N/A',
      registrationDateTime: registrationDateTime,
      username: currentUser?.username || 'N/A'
    };
  }
}