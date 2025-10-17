import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { PurchaseHistoryData } from '../../../../services/purchase/models/history/purchase-history-response.model';
import { PurchaseService } from '../../../../services/purchase/purchase-service';
import { delay, finalize } from 'rxjs';

@Component({
  selector: 'app-purchase-history',
  standalone: false,
  templateUrl: './purchase-history.html',
  styleUrl: './purchase-history.css'
})
export class PurchaseHistory implements OnChanges {
  @Input() productId: number | null = null;

  historyData = signal<PurchaseHistoryData[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private purchaseService: PurchaseService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId !== null) {
      this.loadHistory();
    }
  }

  private loadHistory(): void {
    if (this.productId === null) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.purchaseService.getPurchaseHistory(this.productId, 5)
      .pipe(
        delay(800),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.historyData.set(response.data);
          } else {
            this.historyData.set([]);
            this.errorMessage.set(response.message || 'No se encontró historial');
          }
        },
        error: (error) => {
          console.error('Error loading purchase history:', error);
          this.historyData.set([]);
          this.errorMessage.set('Error al cargar el historial de compras');
        }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  }

  trackByIndex(index: number): number {
    return index;
  }
}