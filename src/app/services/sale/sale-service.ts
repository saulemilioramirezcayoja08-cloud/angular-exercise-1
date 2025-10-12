import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SaleHistoryResponse} from './models/history/sale-history-response.model';
import {SaleCancelRequest} from './models/cancel/sale-cancel-request.model';
import {SaleActionResponse} from './models/action/sale-action-response.model';
import {SaleHistoryParams} from './models/history/sale-history-request.model';
import {SaleConfirmRequest} from './models/confirm/sale-confirm-request.model';
import {SaleSearchResponse} from './models/search/sale-search-response.model';
import {SaleSearchParams} from './models/search/sale-search-request.model';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly baseUrl = 'http://localhost:8080/api/sales';

  constructor(private http: HttpClient) {
  }

  getSalesHistory(params: SaleHistoryParams): Observable<SaleHistoryResponse> {
    let httpParams = new HttpParams();

    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<SaleHistoryResponse>(
      `${this.baseUrl}/history/${params.productId}`,
      {params: httpParams}
    );
  }

  cancelSale(saleId: number, request: SaleCancelRequest): Observable<SaleActionResponse> {
    return this.http.put<SaleActionResponse>(
      `${this.baseUrl}/${saleId}/cancel`,
      request
    );
  }

  confirmSale(saleId: number, request: SaleConfirmRequest): Observable<SaleActionResponse> {
    return this.http.put<SaleActionResponse>(
      `${this.baseUrl}/${saleId}/confirm`,
      request
    );
  }

  searchByNumber(number: string, page?: number, size?: number): Observable<SaleSearchResponse> {
    const searchParams: SaleSearchParams = {number, page, size};
    return this.executeSearch(searchParams);
  }

  searchByStatus(status: string, page?: number, size?: number): Observable<SaleSearchResponse> {
    const searchParams: SaleSearchParams = {status, page, size};
    return this.executeSearch(searchParams);
  }

  searchByUsername(username: string, page?: number, size?: number): Observable<SaleSearchResponse> {
    const searchParams: SaleSearchParams = {username, page, size};
    return this.executeSearch(searchParams);
  }

  searchByDateRange(dateFrom: string, dateTo: string, page?: number, size?: number): Observable<SaleSearchResponse> {
    const searchParams: SaleSearchParams = {dateFrom, dateTo, page, size};
    return this.executeSearch(searchParams);
  }

  private executeSearch(searchParams: SaleSearchParams): Observable<SaleSearchResponse> {
    let params = new HttpParams();

    if (searchParams.number) {
      params = params.set('number', searchParams.number);
    }

    if (searchParams.status) {
      params = params.set('status', searchParams.status);
    }

    if (searchParams.username) {
      params = params.set('username', searchParams.username);
    }

    if (searchParams.dateFrom) {
      params = params.set('dateFrom', searchParams.dateFrom);
    }

    if (searchParams.dateTo) {
      params = params.set('dateTo', searchParams.dateTo);
    }

    if (searchParams.page !== undefined) {
      params = params.set('page', searchParams.page.toString());
    }

    if (searchParams.size !== undefined) {
      params = params.set('size', searchParams.size.toString());
    }

    return this.http.get<SaleSearchResponse>(`${this.baseUrl}/search`, {params});
  }
}
