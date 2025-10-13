import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrderPrintData } from '../../services/order-print/models/order-print-data.model';
import { Subject, takeUntil } from 'rxjs';
import { OrderPrintService } from '../../services/order-print/order-print.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-print',
  standalone: false,
  templateUrl: './order-print.html',
  styleUrl: './order-print.css'
})
export class OrderPrint implements OnInit, OnDestroy {
  orderData: OrderPrintData | null = null;
  private destroy$ = new Subject<void>();
  private mode: 'preview' | 'generate' | null = null;

  constructor(
    private orderPrintService: OrderPrintService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.mode = params['mode'] as 'preview' | 'generate' | null;
    });

    this.orderPrintService.getPrintData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (!data) {
          this.router.navigate(['/order']);
          return;
        }

        this.orderData = data;

        setTimeout(() => {
          this.openPrintDialog();
        }, 100);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private openPrintDialog(): void {
    window.print();

    if (this.mode === 'generate') {
      setTimeout(() => {
        this.orderPrintService.clearPrintData();
        this.router.navigate(['/order']);
      }, 500);

    } else if (this.mode === 'preview') {
      setTimeout(() => {
        this.router.navigate(['/order']);
      }, 500);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatQuantity(quantity: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(quantity);
  }
}