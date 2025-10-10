export type SearchType = 'number' | 'status' | 'username' | 'dateRange';

export interface SearchCriteria {
  type: SearchType;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
}
