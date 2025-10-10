import {Component, EventEmitter, OnDestroy, Output, signal} from '@angular/core';
import {SearchCriteria, SearchType} from '../../../../models/search.models';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';

type QuotationStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELED';

@Component({
  selector: 'app-list-top',
  standalone: false,
  templateUrl: './list-top.html',
  styleUrl: './list-top.css'
})
export class ListTop implements OnDestroy {
  @Output() searchRequested = new EventEmitter<SearchCriteria>();

  searchQuery = signal<string>('');
  searchType = signal<SearchType>('number');
  selectedStatus = signal<QuotationStatus>('DRAFT');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitTextSearch();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isDateRangeMode(): boolean {
    return this.searchType() === 'dateRange';
  }

  isStatusMode(): boolean {
    return this.searchType() === 'status';
  }

  isTextMode(): boolean {
    return this.searchType() === 'number' || this.searchType() === 'username';
  }

  getGroupClass(): string {
    const type = this.searchType();
    if (type === 'number') return 'group number-active';
    if (type === 'status') return 'group status-active';
    if (type === 'username') return 'group username-active';
    return 'group';
  }

  getStatusGroupClass(): string {
    const status = this.selectedStatus();
    if (status === 'DRAFT') return 'status-group draft-active';
    if (status === 'CONFIRMED') return 'status-group confirmed-active';
    if (status === 'CANCELED') return 'status-group canceled-active';
    return 'status-group';
  }

  changeSearchType(type: 'number' | 'status' | 'username'): void {
    this.searchType.set(type);
    this.searchQuery.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.searchSubject.next();

    if (type === 'status') {
      setTimeout(() => this.emitStatusSearch(), 0);
    }
  }

  selectStatus(status: QuotationStatus): void {
    this.selectedStatus.set(status);
    this.emitStatusSearch();
  }

  toggleDateRangeMode(): void {
    if (this.isDateRangeMode()) {
      this.searchType.set('number');
      this.searchQuery.set('');
      this.dateFrom.set('');
      this.dateTo.set('');
    } else {
      this.searchType.set('dateRange');
      this.searchQuery.set('');
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      this.dateFrom.set(this.formatDateForInput(firstDay));
      this.dateTo.set(this.formatDateForInput(today));
    }
  }

  onQueryChange(value: string): void {
    this.searchQuery.set(value);
    if (value.trim()) {
      this.searchSubject.next();
    }
  }

  onDateFromChange(value: string): void {
    this.dateFrom.set(value);
  }

  onDateToChange(value: string): void {
    this.dateTo.set(value);
  }

  onSearchByDateClick(): void {
    const from = this.dateFrom();
    const to = this.dateTo();

    if (!from || !to) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    if (from > to) {
      alert('La fecha inicial debe ser anterior a la fecha final');
      return;
    }

    this.emitDateSearch();
  }

  canSearchByDate(): boolean {
    const from = this.dateFrom();
    const to = this.dateTo();
    return !!(from && to && from <= to);
  }

  getPlaceholder(): string {
    const type = this.searchType();

    switch (type) {
      case 'number':
        return 'Buscar por número de cotización...';
      case 'username':
        return 'Buscar por nombre de usuario...';
      default:
        return 'Buscar cotizaciones...';
    }
  }

  private emitTextSearch(): void {
    if (!this.isTextMode()) {
      return;
    }

    const query = this.searchQuery().trim();

    if (!query) {
      return;
    }

    this.searchRequested.emit({
      type: this.searchType(),
      query: query
    });
  }

  private emitStatusSearch(): void {
    const status = this.selectedStatus();

    this.searchRequested.emit({
      type: 'status',
      query: status
    });
  }

  private emitDateSearch(): void {
    const from = this.dateFrom();
    const to = this.dateTo();

    if (!from || !to) {
      return;
    }

    this.searchRequested.emit({
      type: 'dateRange',
      dateFrom: from,
      dateTo: to
    });
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
