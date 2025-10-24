import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockAvailabilityResponse } from './models/stock-availability-response.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly baseUrl = 'http://192.168.0.156:8080/api/stocks';

  constructor(private http: HttpClient) {
  }

  getAvailability(productId: number): Observable<StockAvailabilityResponse> {
    return this.http.get<StockAvailabilityResponse>(`${this.baseUrl}/availability/${productId}`);
  }
}
