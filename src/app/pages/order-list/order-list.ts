import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { OrderSearchData, PaginationMetadata } from '../../services/order/models/search/order-search-response.model';
import { SearchEvent } from './components/list-top-order/list-top-order';
import { delay, finalize, Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../services/order/order-service';
import { OrderAction } from './components/list-middle-order/list-middle-order';
import { OrderCancelRequest } from '../../services/order/models/cancel/order-cancel-request.model';
import { OrderConfirmRequest } from '../../services/order/models/confirm/order-confirm-request.model';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { OrderPrintService } from '../../services/order-print/order-print.service';
import { OrderPrintMapper } from '../../services/order/order-print-mapper';

@Component({
  selector: 'app-order-list',
  standalone: false,
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderList implements OnInit, OnDestroy {
  orders = signal<OrderSearchData[]>([]);
  pagination = signal<PaginationMetadata | null>(null);

  currentSearchEvent = signal<SearchEvent | null>(null);
  searchType = signal<'number' | 'username' | 'status' | 'dateRange' | null>(null);
  currentPage = signal<number>(0);
  currentSize = signal<number>(5);

  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  private searchSubject$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private orderPrintService: OrderPrintService,
    private orderPrintMapper: OrderPrintMapper
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.searchSubject$.next();
    this.searchSubject$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchRequested(event: SearchEvent): void {
    this.currentSearchEvent.set(event);
    this.searchType.set(event.type);
    this.currentPage.set(0);
    this.performSearch();
  }

  onSearchCleared(): void {
    this.orders.set([]);
    this.pagination.set(null);
    this.hasSearched.set(false);
    this.currentSearchEvent.set(null);
    this.searchType.set(null);
  }

  onPageChanged(page: number): void {
    this.currentPage.set(page);
    this.performSearch();
  }

  onSizeChanged(size: number): void {
    this.currentSize.set(size);
    this.currentPage.set(0);
    this.performSearch();
  }

  onGoToFirstPage(): void {
    this.currentPage.set(0);
    this.performSearch();
  }

  onGoToLastPage(): void {
    const pag = this.pagination();
    if (pag && pag.totalPages > 0) {
      this.currentPage.set(pag.totalPages - 1);
      this.performSearch();
    }
  }

  onOrderSelected(orderId: number): void {
    console.log('Order selected:', orderId);
  }

  onOrderAction(action: OrderAction): void {
    if (action.action === 'confirm') {
      this.handleConfirmOrder(action.orderId, action.orderNumber);
    } else if (action.action === 'cancel') {
      this.handleCancelOrder(action.orderId, action.orderNumber);
    } else if (action.action === 'advance') {
      this.handleAdvanceOrder(action.orderId, action.orderNumber);
    } else if (action.action === 'print') {
      this.handlePrintOrder(action.orderId);
    }
  }

  private handlePrintOrder(orderId: number): void {
    this.setOrderProcessing(orderId, true);

    this.orderService.getOrderById(orderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setOrderProcessing(orderId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const printData = this.orderPrintMapper.transformToPrintData(response.data);

            this.orderPrintService.setPrintData(printData);

            this.router.navigate(['/order/print'], {
              queryParams: { mode: 'generate' }
            });
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al obtener orden para imprimir:', error);
          this.handlePrintError(error);
        }
      });
  }

  private handleAdvanceOrder(orderId: number, orderNumber: string): void {
    const order = this.orders().find(o => o.id === orderId);

    if (!order) {
      this.showError('Orden no encontrada');
      return;
    }

    if (order.status !== 'DRAFT') {
      this.showError(
        `No se pueden agregar anticipos a órdenes ${order.status}\n\n` +
        `Estado actual: ${order.status}\n` +
        `Estado requerido: DRAFT\n\n` +
        `Solo las órdenes en estado BORRADOR pueden recibir anticipos.`
      );
      return;
    }

    const availableAmount = order.totalAmount - order.totalAdvances;
    if (availableAmount <= 0) {
      this.showError('Esta orden ya tiene anticipos por el total del monto');
      return;
    }

    const infoMessage = `Agregar anticipo a la orden #${orderNumber}\n\n` +
      `───────────────────────────────\n` +
      `Total Orden:    ${this.formatCurrency(order.totalAmount)}\n` +
      `Ya Pagado:      ${this.formatCurrency(order.totalAdvances)}\n` +
      `───────────────────────────────\n` +
      `Falta Pagar:    ${this.formatCurrency(availableAmount)}\n\n` +
      `Sugerencia: Pagar el total restante\n\n` +
      `Ingrese el monto del anticipo (máx ${this.formatCurrency(availableAmount)}):`;

    const amountStr = prompt(infoMessage);

    if (amountStr === null) {
      return;
    }

    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      this.showError('Debe ingresar un monto válido mayor a 0');
      return;
    }

    if (amount > availableAmount) {
      this.showError(
        `El monto no puede exceder el disponible.\n\n` +
        `Disponible: ${this.formatCurrency(availableAmount)}\n` +
        `Ingresado: ${this.formatCurrency(amount)}`
      );
      return;
    }

    const confirmed = confirm(
      `¿Confirmar anticipo?\n\n` +
      `───────────────────────────────\n` +
      `Orden: #${orderNumber}\n` +
      `Monto: ${this.formatCurrency(amount)}\n` +
      `───────────────────────────────\n\n` +
      `Esta acción registrará el anticipo y actualizará el saldo de la orden.`
    );

    if (!confirmed) {
      return;
    }

    this.createAdvance(orderId, amount);
  }

  private createAdvance(orderId: number, amount: number): void {
    this.setOrderProcessing(orderId, true);

    this.orderService.createAdvanceForOrder(orderId, amount, this.getCurrentUserId())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setOrderProcessing(orderId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(
              `Anticipo registrado exitosamente\n\n` +
              `───────────────────────────────\n` +
              `ID Anticipo: #${response.data?.id}\n` +
              `Monto: ${this.formatCurrency(response.data?.amount || 0)}\n` +
              `───────────────────────────────`
            );
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al crear anticipo:', error);
          this.handleAdvanceError(error);
        }
      });
  }

  private handleConfirmOrder(orderId: number, orderNumber: string): void {
    const order = this.orders().find(o => o.id === orderId);

    if (!order) {
      this.showError('Orden no encontrada');
      return;
    }

    if (order.status !== 'DRAFT') {
      this.showError(
        `No se puede confirmar la orden #${orderNumber}\n\n` +
        `Estado actual: ${order.status}\n` +
        `Estado requerido: DRAFT\n\n` +
        `Las órdenes solo pueden confirmarse cuando están en estado BORRADOR.`
      );
      return;
    }

    if (order.totalAdvances !== order.totalAmount) {
      const pending = order.totalAmount - order.totalAdvances;
      const comparison = order.totalAdvances < order.totalAmount ? 'menor' : 'mayor';

      this.showError(
        `No se puede confirmar la orden #${orderNumber}\n\n` +
        `RESUMEN DE PAGO:\n` +
        `───────────────────────────────\n` +
        `Total Orden:    ${this.formatCurrency(order.totalAmount)}\n` +
        `Anticipos:      ${this.formatCurrency(order.totalAdvances)}\n` +
        `───────────────────────────────\n` +
        `Pendiente:      ${this.formatCurrency(Math.abs(pending))}\n\n` +
        `VALIDACIÓN:\n` +
        `Los anticipos deben ser exactamente iguales al total de la orden.\n\n` +
        `El total de anticipos es ${comparison} que el total de la orden.\n\n` +
        `Por favor, agregue los anticipos faltantes antes de confirmar.`
      );
      return;
    }

    const confirmed = confirm(
      `¿Confirmar la orden #${orderNumber}?\n\n` +
      `RESUMEN DE PAGO:\n` +
      `───────────────────────────────\n` +
      `Total Orden:    ${this.formatCurrency(order.totalAmount)}\n` +
      `Anticipos:      ${this.formatCurrency(order.totalAdvances)}\n` +
      `Pendiente:      ${this.formatCurrency(0.00)}\n` +
      `───────────────────────────────\n\n` +
      `Pago completo verificado\n\n` +
      `Esta acción:\n` +
      `• Creará una venta asociada\n` +
      `• Cambiará el estado a CONFIRMADO\n` +
      `• No podrá revertirse\n\n` +
      `¿Deseas continuar?`
    );

    if (!confirmed) {
      return;
    }

    const notes = prompt('Notas de confirmación (opcional):');

    if (notes === null) {
      return;
    }

    this.confirmOrder(orderId, notes);
  }

  private confirmOrder(orderId: number, notes: string): void {
    this.setOrderProcessing(orderId, true);

    const request: OrderConfirmRequest = {
      confirmNotes: notes || '',
      userId: this.getCurrentUserId()
    };

    this.orderService.confirmOrder(orderId, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setOrderProcessing(orderId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(`Orden #${response.data?.number} confirmada exitosamente`);
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al confirmar orden:', error);
          this.handleApiError(error, 'confirmar');
        }
      });
  }

  private handleCancelOrder(orderId: number, orderNumber: string): void {
    const order = this.orders().find(o => o.id === orderId);

    if (!order) {
      this.showError('Orden no encontrada');
      return;
    }

    if (order.status !== 'DRAFT') {
      this.showError(
        `No se puede cancelar la orden #${orderNumber}\n\n` +
        `Estado actual: ${order.status}\n` +
        `Estado requerido: DRAFT\n\n` +
        `Las órdenes solo pueden cancelarse cuando están en estado BORRADOR.`
      );
      return;
    }

    const notes = prompt(
      `Cancelar la orden #${orderNumber}\n\n` +
      `Esta acción:\n` +
      `• Cancelará las reservaciones asociadas\n` +
      `• Cambiará el estado a CANCELADO\n` +
      `• No podrá revertirse\n\n` +
      `Escribe el motivo de cancelación:`
    );

    if (notes === null) {
      return;
    }

    if (!notes.trim()) {
      this.showError('Debes especificar un motivo para cancelar la orden');
      return;
    }

    const confirmed = confirm(
      `¿CONFIRMAR CANCELACIÓN?\n\n` +
      `Orden: #${orderNumber}\n` +
      `Motivo: "${notes}"\n\n` +
      `ADVERTENCIA:\n` +
      `• Las reservaciones se cancelarán\n` +
      `• Esta acción NO puede revertirse\n` +
      `• Los anticipos registrados permanecerán\n\n` +
      `¿Proceder con la cancelación?`
    );

    if (!confirmed) {
      return;
    }

    this.cancelOrder(orderId, notes);
  }

  private cancelOrder(orderId: number, notes: string): void {
    this.setOrderProcessing(orderId, true);

    const request: OrderCancelRequest = {
      cancelNotes: notes,
      userId: this.getCurrentUserId()
    };

    this.orderService.cancelOrder(orderId, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setOrderProcessing(orderId, false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess(`Orden #${response.data?.number} cancelada exitosamente`);
            this.performSearch();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Error al cancelar orden:', error);
          this.handleApiError(error, 'cancelar');
        }
      });
  }

  private performSearch(): void {
    const searchEvent = this.currentSearchEvent();
    if (!searchEvent) {
      return;
    }

    this.searchSubject$.next();

    const page = this.currentPage();
    const size = this.currentSize();

    this.isLoading.set(true);
    this.hasSearched.set(true);

    let searchObservable;

    switch (searchEvent.type) {
      case 'number':
        if (!searchEvent.query) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.orderService.searchByNumber(searchEvent.query, page, size);
        break;

      case 'username':
        if (!searchEvent.query) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.orderService.searchByUsername(searchEvent.query, page, size);
        break;

      case 'status':
        if (!searchEvent.status) {
          this.isLoading.set(false);
          return;
        }
        searchObservable = this.orderService.searchByStatus(searchEvent.status, page, size);
        break;

      case 'dateRange':
        if (!searchEvent.dateFrom || !searchEvent.dateTo) {
          this.isLoading.set(false);
          return;
        }
        const isoDateFrom = this.toISO8601(searchEvent.dateFrom, false);
        const isoDateTo = this.toISO8601(searchEvent.dateTo, true);
        searchObservable = this.orderService.searchByDateRange(isoDateFrom, isoDateTo, page, size);
        break;

      default:
        this.isLoading.set(false);
        return;
    }

    searchObservable
      .pipe(
        delay(800),
        takeUntil(this.searchSubject$),
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            const ordersWithProcessing = (response.data || []).map(order => ({
              ...order,
              isProcessing: false
            }));
            this.orders.set(ordersWithProcessing);
            this.pagination.set(response.pagination);
          } else {
            this.showError(response.message);
            this.orders.set([]);
            this.pagination.set(null);
          }
        },
        error: (error) => {
          console.error('Error searching orders:', error);
          this.handleSearchError(error);
          this.orders.set([]);
          this.pagination.set(null);
        }
      });
  }

  private setOrderProcessing(orderId: number, isProcessing: boolean): void {
    const currentOrders = this.orders();
    const updatedOrders = currentOrders.map(order =>
      order.id === orderId
        ? { ...order, isProcessing }
        : order
    );
    this.orders.set(updatedOrders);
  }

  private getCurrentUserId(): number {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.userId) {
      return currentUser.userId;
    }
    console.warn('No se pudo obtener el userId del usuario actual, usando fallback');
    return 1;
  }

  private toISO8601(dateString: string, isEndOfDay: boolean = false): string {
    if (!dateString) {
      return '';
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (isEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date.toISOString();
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  }

  private handleAdvanceError(error: any): void {
    let message = 'Error al crear el anticipo';

    if (error.status === 404) {
      message = `${error.error?.message || 'Orden no encontrada'}\n\n` +
        `La orden solicitada no existe en el sistema.`;
    } else if (error.status === 409) {
      message = `${error.error?.message || 'El monto excede el total disponible'}\n\n` +
        `Verifique el monto ingresado e intente nuevamente.`;
    } else if (error.status === 0) {
      message = 'No se puede conectar con el servidor\n\n' +
        'Por favor, verifique su conexión a internet e intente nuevamente.';
    } else if (error.error?.message) {
      message = `${error.error.message}`;
    }

    this.showError(message);
  }

  private handleApiError(error: any, action: string): void {
    let message = `Error al ${action} la orden`;

    if (error.status === 404) {
      message = `${error.error?.message || 'Orden no encontrada'}\n\n` +
        `La orden solicitada no existe en el sistema.`;
    } else if (error.status === 409) {
      const baseMessage = error.error?.message || 'La orden no puede ser modificada en su estado actual';
      message = `${baseMessage}\n\n`;

      if (action === 'confirmar' && baseMessage.includes('advances')) {
        message += `Los anticipos no coinciden con el total de la orden.\n` +
          `Verifique los montos y vuelva a intentar.`;
      } else {
        message += `Verifique el estado de la orden e intente nuevamente.`;
      }
    } else if (error.status === 0) {
      message = 'No se puede conectar con el servidor\n\n' +
        'Por favor, verifique su conexión a internet e intente nuevamente.';
    } else if (error.error?.message) {
      message = `${error.error.message}`;
    }

    this.showError(message);
  }

  private handlePrintError(error: any): void {
    let message = 'Error al obtener la orden para imprimir';

    if (error.status === 404) {
      message = `${error.error?.message || 'Orden no encontrada'}\n\n` +
        `La orden solicitada no existe en el sistema.`;
    } else if (error.status === 0) {
      message = 'No se puede conectar con el servidor\n\n' +
        'Por favor, verifique su conexión a internet e intente nuevamente.';
    } else if (error.error?.message) {
      message = `${error.error.message}`;
    }

    this.showError(message);
  }

  private handleSearchError(error: any): void {
    let message: string;

    if (error.status === 0) {
      message = 'No se puede conectar con el servidor\n\n' +
        'Por favor, verifique su conexión a internet.';
    } else if (error.status === 400) {
      message = 'Parámetros de búsqueda inválidos\n\n' +
        'Verifique los criterios de búsqueda e intente nuevamente.';
    } else if (error.status === 404) {
      message = 'No se encontraron resultados\n\n' +
        'Intente con otros criterios de búsqueda.';
    } else if (error.status === 500) {
      message = 'Error interno del servidor\n\n' +
        'Por favor, contacte al administrador del sistema.';
    } else if (error.error?.message) {
      message = `${error.error.message}`;
    } else {
      message = 'Error al buscar órdenes\n\n' +
        'Intente nuevamente más tarde.';
    }

    this.showError(message);
  }

  private showSuccess(message: string): void {
    alert(message);
  }

  private showError(message: string): void {
    alert(message);
  }
}