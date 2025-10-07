import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {NotesUpdateEvent, QuotationTotals} from '../../../../models/quotation.models';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-bottom',
  standalone: false,
  templateUrl: './bottom.html',
  styleUrl: './bottom.css'
})
export class Bottom implements OnDestroy {
  @Input() totals: QuotationTotals = this.getEmptyTotals();
  @Input() notes: string = '';
  @Input() isGenerating: boolean = false;

  @Output() notesChanged = new EventEmitter<NotesUpdateEvent>();
  @Output() generateQuotation = new EventEmitter<void>();

  private notesSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.notesSubject.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(notes => {
      this.notesChanged.emit({notes});
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNotesInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const newNotes = textarea.value;

    this.notesSubject.next(newNotes);
  }

  onGenerateClick(): void {
    if (this.isGenerating) {
      return;
    }

    this.generateQuotation.emit();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  }

  private getEmptyTotals(): QuotationTotals {
    return {
      subtotal: 0,
      totalDiscount: 0,
      grandTotal: 0
    };
  }
}
