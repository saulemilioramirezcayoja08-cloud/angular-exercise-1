import { Injectable } from '@angular/core';
import {DraftQuotationRequest} from './models/draft/draft-request.model';
import {Observable} from 'rxjs';
import {DraftQuotationResponse} from './models/draft/draft-response.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private readonly baseUrl = 'http://localhost:8080/api/quotations';

  constructor(private http: HttpClient) {}

  createDraft(request: DraftQuotationRequest): Observable<DraftQuotationResponse> {
    return this.http.post<DraftQuotationResponse>(this.baseUrl, request);
  }
}
