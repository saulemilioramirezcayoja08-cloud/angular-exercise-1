import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CustomerCreateRequest } from './models/customer-create-request.model';
import { Observable } from 'rxjs';
import { CustomerCreateResponse } from './models/customer-create-response.model';
import { CustomerDetailResponse } from './models/customer-detail-response.model';
import { CustomerPageResponse } from './models/customer-page-response.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly baseUrl = 'http://192.168.0.156:8080/api/customers';

  constructor(private http: HttpClient) {
  }

  create(customer: CustomerCreateRequest): Observable<CustomerCreateResponse> {
    return this.http.post<CustomerCreateResponse>(this.baseUrl, customer);
  }

  getById(id: number): Observable<CustomerDetailResponse> {
    return this.http.get<CustomerDetailResponse>(`${this.baseUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'asc'): Observable<CustomerPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<CustomerPageResponse>(this.baseUrl, { params });
  }

  searchByName(name: string, page: number = 0, size: number = 10, sortBy: string = 'name', sortDir: string = 'asc'): Observable<CustomerPageResponse> {
    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<CustomerPageResponse>(`${this.baseUrl}/search`, { params });
  }
}
