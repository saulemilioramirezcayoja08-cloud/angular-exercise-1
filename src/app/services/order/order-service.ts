import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DraftOrderRequest} from './models/draft/draft-request.model';
import {Observable} from 'rxjs';
import {DraftOrderResponse} from './models/draft/draft-response.model';
import {OrderSearchResponse} from './models/search/order-search-response.model';
import {OrderSearchParams} from './models/search/order-search-request.model';
import {OrderCancelRequest} from './models/cancel/order-cancel-request.model';
import {OrderActionResponse} from './models/action/order-action-response.model';
import {OrderConfirmRequest} from './models/confirm/order-confirm-request.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {
  }

  createDraft(request: DraftOrderRequest): Observable<DraftOrderResponse> {
    return this.http.post<DraftOrderResponse>(this.baseUrl, request);
  }

  cancelOrder(orderId: number, request: OrderCancelRequest): Observable<OrderActionResponse> {
    return this.http.put<OrderActionResponse>(`${this.baseUrl}/${orderId}/cancel`, request);
  }

  confirmOrder(orderId: number, request: OrderConfirmRequest): Observable<OrderActionResponse> {
    return this.http.put<OrderActionResponse>(`${this.baseUrl}/${orderId}/confirm`, request);
  }

  searchByNumber(number: string, page?: number, size?: number): Observable<OrderSearchResponse> {
    const searchParams: OrderSearchParams = {number, page, size};
    return this.executeSearch(searchParams);
  }

  searchByStatus(status: string, page?: number, size?: number): Observable<OrderSearchResponse> {
    const searchParams: OrderSearchParams = {status, page, size};
    return this.executeSearch(searchParams);
  }

  searchByUsername(username: string, page?: number, size?: number): Observable<OrderSearchResponse> {
    const searchParams: OrderSearchParams = {username, page, size};
    return this.executeSearch(searchParams);
  }

  searchByDateRange(dateFrom: string, dateTo: string, page?: number, size?: number): Observable<OrderSearchResponse> {
    const searchParams: OrderSearchParams = {dateFrom, dateTo, page, size};
    return this.executeSearch(searchParams);
  }

  private executeSearch(searchParams: OrderSearchParams): Observable<OrderSearchResponse> {
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

    return this.http.get<OrderSearchResponse>(`${this.baseUrl}/search`, {params});
  }
}
