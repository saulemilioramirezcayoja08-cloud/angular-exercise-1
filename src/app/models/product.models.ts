export interface ProductSearchEvent {
  query: string;
  searchType: 'name' | 'sku' | 'all';
}
