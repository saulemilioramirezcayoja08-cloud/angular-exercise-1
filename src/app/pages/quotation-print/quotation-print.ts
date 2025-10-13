import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuotationPrintData } from '../../services/quotation-print/models/quotation-print-data.model';
import { Subject, takeUntil } from 'rxjs';
import { QuotationPrintService } from '../../services/quotation-print/quotation-print-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-quotation-print',
  standalone: false,
  templateUrl: './quotation-print.html',
  styleUrl: './quotation-print.css'
})
export class QuotationPrint implements OnInit, OnDestroy {
  quotationData: QuotationPrintData | null = null;
  private destroy$ = new Subject<void>();
  private mode: 'preview' | 'generate' | null = null;

  constructor(
    private quotationPrintService: QuotationPrintService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.mode = params['mode'] as 'preview' | 'generate' | null;
    });

    this.quotationPrintService.getPrintData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (!data) {
          this.router.navigate(['/quotation']);
          return;
        }

        this.quotationData = data;

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
        this.quotationPrintService.clearPrintData();
        this.router.navigate(['/quotation']);
      }, 500);

    } else if (this.mode === 'preview') {
      setTimeout(() => {
        this.router.navigate(['/quotation']);
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