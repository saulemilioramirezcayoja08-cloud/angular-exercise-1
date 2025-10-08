import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DraftOrderRequest } from './models/draft/draft-request.model';
import { Observable } from 'rxjs';
import { DraftOrderResponse } from './models/draft/draft-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) { }

  createDraft(request: DraftOrderRequest): Observable<DraftOrderResponse> {
    return this.http.post<DraftOrderResponse>(this.baseUrl, request);
  }
}