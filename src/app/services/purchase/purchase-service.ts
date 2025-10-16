import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {PurchaseCreateRequest} from './models/create/purchase-create-request.model';
import {Observable} from 'rxjs';
import {PurchaseCreateResponse} from './models/create/purchase-create-response.model';
import {PurchaseCancelRequest} from './models/cancel/purchase-cancel-request.model';
import {PurchaseActionResponse} from './models/action/purchase-action-response.model';
import {PurchaseConfirmRequest} from './models/confirm/purchase-confirm-request.model';
import {PurchaseDetailResponse} from './models/detail/purchase-detail-response.model';
import {PurchaseHistoryResponse} from './models/history/purchase-history-response.model';
import {PurchaseSearchParams} from './models/search/purchase-search-request.model';
import {PurchaseSearchResponse} from './models/search/purchase-search-response.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly baseUrl = 'http://localhost:8080/api/purchases';

  constructor(private http: HttpClient) {
  }

  create(request: PurchaseCreateRequest): Observable<PurchaseCreateResponse> {
    return this.http.post<PurchaseCreateResponse>(this.baseUrl, request);
  }

  cancelPurchase(purchaseId: number, request: PurchaseCancelRequest): Observable<PurchaseActionResponse> {
    return this.http.put<PurchaseActionResponse>(`${this.baseUrl}/${purchaseId}/cancel`, request);
  }

  confirmPurchase(purchaseId: number, request: PurchaseConfirmRequest): Observable<PurchaseActionResponse> {
    return this.http.put<PurchaseActionResponse>(`${this.baseUrl}/${purchaseId}/confirm`, request);
  }

  getPurchaseById(purchaseId: number): Observable<PurchaseDetailResponse> {
    return this.http.get<PurchaseDetailResponse>(`${this.baseUrl}/${purchaseId}`);
  }

  getPurchaseHistory(productId: number, limit?: number): Observable<PurchaseHistoryResponse> {
    let params = new HttpParams();

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<PurchaseHistoryResponse>(`${this.baseUrl}/history/${productId}`, { params });
  }

  searchByNumber(number: string, page?: number, size?: number): Observable<PurchaseSearchResponse> {
    const searchParams: PurchaseSearchParams = { number, page, size };
    return this.executeSearch(searchParams);
  }

  searchByStatus(status: string, page?: number, size?: number): Observable<PurchaseSearchResponse> {
    const searchParams: PurchaseSearchParams = { status, page, size };
    return this.executeSearch(searchParams);
  }

  searchByUsername(username: string, page?: number, size?: number): Observable<PurchaseSearchResponse> {
    const searchParams: PurchaseSearchParams = { username, page, size };
    return this.executeSearch(searchParams);
  }

  searchByDateRange(dateFrom: string, dateTo: string, page?: number, size?: number): Observable<PurchaseSearchResponse> {
    const searchParams: PurchaseSearchParams = { dateFrom, dateTo, page, size };
    return this.executeSearch(searchParams);
  }

  private executeSearch(searchParams: PurchaseSearchParams): Observable<PurchaseSearchResponse> {
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

    return this.http.get<PurchaseSearchResponse>(`${this.baseUrl}/search`, { params });
  }
}
