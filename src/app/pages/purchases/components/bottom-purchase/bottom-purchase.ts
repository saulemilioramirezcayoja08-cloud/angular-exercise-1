import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {PurchaseTotals, NotesUpdateEvent} from '../../../../models/purchase.models';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-bottom-purchase',
  standalone: false,
  templateUrl: './bottom-purchase.html',
  styleUrl: './bottom-purchase.css'
})
export class BottomPurchase implements OnDestroy {
  @Input() totals: PurchaseTotals = this.getEmptyTotals();
  @Input() notes: string = '';
  @Input() isGenerating: boolean = false;

  @Output() notesChanged = new EventEmitter<NotesUpdateEvent>();
  @Output() generatePurchase = new EventEmitter<void>();

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

    this.generatePurchase.emit();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  }

  private getEmptyTotals(): PurchaseTotals {
    return {
      subtotal: 0,
      grandTotal: 0
    };
  }
}
