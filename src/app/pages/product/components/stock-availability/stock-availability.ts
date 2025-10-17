import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { WarehouseStock } from '../../../../services/stock/models/stock-availability-response.model';
import { StockService } from '../../../../services/stock/stock-service';
import { delay, finalize } from 'rxjs';

@Component({
  selector: 'app-stock-availability',
  standalone: false,
  templateUrl: './stock-availability.html',
  styleUrl: './stock-availability.css'
})
export class StockAvailability implements OnChanges {
  @Input() productId: number | null = null;

  stockData = signal<WarehouseStock[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private stockService: StockService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId !== null) {
      this.loadStockAvailability();
    }
  }

  private loadStockAvailability(): void {
    if (this.productId === null) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.stockService.getAvailability(this.productId)
      .pipe(
        delay(800),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.stockData.set(response.data);
          } else {
            this.stockData.set([]);
            this.errorMessage.set(response.message || 'No se encontró disponibilidad');
          }
        },
        error: (error) => {
          console.error('Error loading stock availability:', error);
          this.stockData.set([]);
          this.errorMessage.set('Error al cargar la disponibilidad de stock');
        }
      });
  }

  trackByWarehouseCode(_index: number, item: WarehouseStock): string {
    return item.code;
  }
}