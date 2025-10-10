import { Component, signal } from '@angular/core';

type SearchType = 'number' | 'status' | 'username' | 'dateRange';

@Component({
  selector: 'app-list-top',
  standalone: false,
  templateUrl: './list-top.html',
  styleUrl: './list-top.css'
})
export class ListTop {
  searchQuery = signal<string>('');
  searchType = signal<SearchType>('number');
  dateFrom = signal<string>('2025-10-01');
  dateTo = signal<string>('2025-10-09');

  isDateRangeMode(): boolean {
    return this.searchType() === 'dateRange';
  }

  changeSearchType(type: 'number' | 'status' | 'username'): void {
    this.searchType.set(type);
  }

  toggleDateRangeMode(): void {
    if (this.isDateRangeMode()) {
      this.searchType.set('number');
    } else {
      this.searchType.set('dateRange');
    }
  }

  onQueryChange(value: string): void {
    this.searchQuery.set(value);
  }

  onDateFromChange(value: string): void {
    this.dateFrom.set(value);
  }

  onDateToChange(value: string): void {
    this.dateTo.set(value);
  }

  getPlaceholder(): string {
    const type = this.searchType();

    if (type === 'number') {
      return 'Buscar por número de cotización...';
    }

    if (type === 'status') {
      return 'Buscar por estado (DRAFT, CONFIRMED, CANCELED)...';
    }

    if (type === 'username') {
      return 'Buscar por nombre de usuario...';
    }

    return 'Buscar cotizaciones...';
  }
}