import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductSearchResponse } from './models/product-search-response.model';
import { Observable } from 'rxjs';
import { ProductSearchParams } from './models/product-search-request.model';
import { ProductCreateRequest } from './models/product-create-request.model';
import { ProductCreateResponse } from './models/product-create-response.model';
import { ProductPageResponse } from './models/product-page-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {
  }

  create(product: ProductCreateRequest): Observable<ProductCreateResponse> {
    return this.http.post<ProductCreateResponse>(this.baseUrl, product);
  }

  searchBySku(sku: string): Observable<ProductSearchResponse> {
    const searchParams: ProductSearchParams = { sku };
    return this.executeSearch(searchParams);
  }

  searchByName(name: string): Observable<ProductSearchResponse> {
    const searchParams: ProductSearchParams = { name };
    return this.executeSearch(searchParams);
  }

  searchBySkuAndName(sku: string, name: string): Observable<ProductSearchResponse> {
    const searchParams: ProductSearchParams = { sku, name };
    return this.executeSearch(searchParams);
  }

  private executeSearch(searchParams: ProductSearchParams): Observable<ProductSearchResponse> {
    let params = new HttpParams();

    if (searchParams.sku) {
      params = params.set('sku', searchParams.sku);
    }

    if (searchParams.name) {
      params = params.set('name', searchParams.name);
    }

    return this.http.get<ProductSearchResponse>(`${this.baseUrl}/search`, { params });
  }

  getAll(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'asc'): Observable<ProductPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<ProductPageResponse>(this.baseUrl, { params });
  }

  searchByNamePaginated(name: string, page: number = 0, size: number = 10, sortBy: string = 'name', sortDir: string = 'asc'): Observable<ProductPageResponse> {
    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<ProductPageResponse>(`${this.baseUrl}/search/name`, { params });
  }
}