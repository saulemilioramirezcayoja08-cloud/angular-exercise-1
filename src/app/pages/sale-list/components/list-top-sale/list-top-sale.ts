import {Component, EventEmitter, OnDestroy, OnInit, Output, signal} from '@angular/core';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';

type StatusType = 'DRAFT' | 'CONFIRMED' | 'CANCELED';
type SearchType = 'number' | 'username';
type ActivePanel = 'search' | 'status' | 'date';

export interface SearchEvent {
  type: 'number' | 'username' | 'status' | 'dateRange';
  query?: string;
  status?: StatusType;
  dateFrom?: string;
  dateTo?: string;
}

@Component({
  selector: 'app-list-top-sale',
  standalone: false,
  templateUrl: './list-top-sale.html',
  styleUrl: './list-top-sale.css'
})
export class ListTopSale implements OnInit, OnDestroy {
  @Output() searchRequested = new EventEmitter<SearchEvent>();
  @Output() searchCleared = new EventEmitter<void>();

  dateFrom = signal<string>('');
  dateTo = signal<string>('');
  selectedStatus = signal<StatusType>('DRAFT');
  activePanel = signal<ActivePanel>('date');
  searchQuery = signal<string>('');
  searchType = signal<SearchType>('number');

  private searchDebounce$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.dateFrom.set(this.formatDateForInput(firstDay));
    this.dateTo.set(this.formatDateForInput(today));
  }

  ngOnInit(): void {
    this.searchDebounce$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.onSearchEnter());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  activatePanel(panel: ActivePanel): void {
    if (this.activePanel() === panel) {
      return;
    }

    this.activePanel.set(panel);
    this.searchCleared.emit();

    if (panel === 'date') {
      this.performAutoSearch();
    }
  }

  onSearchEnter(): void {
    const query = this.searchQuery().trim();
    const minLength = this.searchType() === 'number' ? 1 : 2;

    if (!query || query.length < minLength) {
      return;
    }

    this.searchRequested.emit({
      type: this.searchType(),
      query: query
    });
  }

  onQueryChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);

    const minLength = this.searchType() === 'number' ? 1 : 2;
    if (value.trim().length >= minLength) {
      this.searchDebounce$.next(value);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchCleared.emit();
  }

  changeSearchType(type: SearchType): void {
    if (this.searchType() === type) {
      return;
    }

    this.searchType.set(type);
    this.searchQuery.set('');
    this.searchCleared.emit();
  }

  onDateFromChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dateFrom.set(value);
    this.performAutoSearch();
  }

  onDateToChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dateTo.set(value);
    this.performAutoSearch();
  }

  selectStatus(status: StatusType): void {
    this.selectedStatus.set(status);

    this.searchRequested.emit({
      type: 'status',
      status: status
    });
  }

  getPlaceholder(): string {
    return this.searchType() === 'number'
      ? 'Buscar por número...'
      : 'Buscar por usuario...';
  }

  private performAutoSearch(): void {
    const from = this.dateFrom();
    const to = this.dateTo();

    if (!from || !to || from > to) {
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
