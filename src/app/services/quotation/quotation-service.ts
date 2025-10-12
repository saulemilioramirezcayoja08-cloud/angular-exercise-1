import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {QuotationSearchResponse} from './models/search/quotation-search-response.model';
import {QuotationSearchParams} from './models/search/quotation-search-request.model';
import {QuotationConfirmRequest} from './models/confirm/quotation-confirm-request.model';
import {QuotationActionResponse} from './models/action/quotation-action-response.model';
import {QuotationCancelRequest} from './models/cancel/quotation-cancel-request.model';
import {DraftQuotationRequest} from './models/draft/draft-request.model';
import {DraftQuotationResponse} from './models/draft/draft-response.model';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private readonly baseUrl = 'http://localhost:8080/api/quotations';

  constructor(private http: HttpClient) {
  }

  createDraft(request: DraftQuotationRequest): Observable<DraftQuotationResponse> {
    return this.http.post<DraftQuotationResponse>(this.baseUrl, request);
  }

  cancelQuotation(quotationId: number, request: QuotationCancelRequest): Observable<QuotationActionResponse> {
    return this.http.put<QuotationActionResponse>(`${this.baseUrl}/${quotationId}/cancel`, request);
  }

  confirmQuotation(quotationId: number, request: QuotationConfirmRequest): Observable<QuotationActionResponse> {
    return this.http.put<QuotationActionResponse>(`${this.baseUrl}/${quotationId}/confirm`, request);
  }

  searchByNumber(number: string, page?: number, size?: number): Observable<QuotationSearchResponse> {
    const searchParams: QuotationSearchParams = {number, page, size};
    return this.executeSearch(searchParams);
  }

  searchByStatus(status: string, page?: number, size?: number): Observable<QuotationSearchResponse> {
    const searchParams: QuotationSearchParams = {status, page, size};
    return this.executeSearch(searchParams);
  }

  searchByUsername(username: string, page?: number, size?: number): Observable<QuotationSearchResponse> {
    const searchParams: QuotationSearchParams = {username, page, size};
    return this.executeSearch(searchParams);
  }

  searchByDateRange(dateFrom: string, dateTo: string, page?: number, size?: number): Observable<QuotationSearchResponse> {
    const searchParams: QuotationSearchParams = {dateFrom, dateTo, page, size};
    return this.executeSearch(searchParams);
  }

  private executeSearch(searchParams: QuotationSearchParams): Observable<QuotationSearchResponse> {
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

    return this.http.get<QuotationSearchResponse>(`${this.baseUrl}/search`, {params});
  }
}
