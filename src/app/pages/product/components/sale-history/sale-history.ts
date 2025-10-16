import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { SaleHistoryData } from '../../../../services/sale/models/history/sale-history-response.model';
import { SaleService } from '../../../../services/sale/sale-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sale-history',
  standalone: false,
  templateUrl: './sale-history.html',
  styleUrl: './sale-history.css'
})
export class SaleHistory implements OnChanges {
  @Input() productId: number | null = null;

  historyData = signal<SaleHistoryData[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private saleService: SaleService) { }

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

    this.saleService.getSalesHistory({ productId: this.productId, limit: 5 })
      .pipe(finalize(() => this.isLoading.set(false)))
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
          console.error('Error loading sale history:', error);
          this.historyData.set([]);
          this.errorMessage.set('Error al cargar el historial de ventas');
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