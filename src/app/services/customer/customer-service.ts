import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CustomerCreateRequest } from './models/customer-create-request.model';
import { Observable } from 'rxjs';
import { CustomerCreateResponse } from './models/customer-create-response.model';
import { CustomerDetailResponse } from './models/customer-detail-response.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly baseUrl = 'http://localhost:8080/api/customers';

  constructor(private http: HttpClient) {
  }

  create(customer: CustomerCreateRequest): Observable<CustomerCreateResponse> {
    return this.http.post<CustomerCreateResponse>(this.baseUrl, customer);
  }

  getById(id: number): Observable<CustomerDetailResponse> {
    return this.http.get<CustomerDetailResponse>(`${this.baseUrl}/${id}`);
  }
}