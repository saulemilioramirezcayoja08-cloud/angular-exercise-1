import { Component, OnDestroy, OnInit } from '@angular/core';
import { SalePrintData } from '../../../services/sale-print/models/sale-print-data.model';
import { Subject, takeUntil } from 'rxjs';
import { SalePrintService } from '../../../services/sale-print/sale-print.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sale-print',
  standalone: false,
  templateUrl: './sale-print.html',
  styleUrl: './sale-print.css'
})
export class SalePrint implements OnInit, OnDestroy {
  saleData: SalePrintData | null = null;
  private destroy$ = new Subject<void>();
  private mode: 'preview' | 'generate' | null = null;

  constructor(
    private salePrintService: SalePrintService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.mode = params['mode'] as 'preview' | 'generate' | null;
    });

    this.salePrintService.getPrintData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (!data) {
          this.router.navigate(['/sale-list']);
          return;
        }

        this.saleData = data;

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
        this.salePrintService.clearPrintData();
        this.router.navigate(['/sale-list']);
      }, 500);
    } else if (this.mode === 'preview') {
      setTimeout(() => {
        this.router.navigate(['/sale-list']);
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DRAFT': return 'BORRADOR';
      case 'CONFIRMED': return 'CONFIRMADA';
      case 'CANCELED': return 'CANCELADA';
      default: return status;
    }
  }
}