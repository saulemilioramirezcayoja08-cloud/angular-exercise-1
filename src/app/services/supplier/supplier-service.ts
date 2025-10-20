import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SupplierCreateRequest } from './models/supplier-create-request.model';
import { SupplierCreateResponse } from './models/supplier-create-response.model';
import { Observable } from 'rxjs';
import { SupplierDetailResponse } from './models/supplier-detail-response.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly baseUrl = 'http://localhost:8080/api/suppliers';

  constructor(private http: HttpClient) {
  }

  create(supplier: SupplierCreateRequest): Observable<SupplierCreateResponse> {
    return this.http.post<SupplierCreateResponse>(this.baseUrl, supplier);
  }

  getById(id: number): Observable<SupplierDetailResponse> {
    return this.http.get<SupplierDetailResponse>(`${this.baseUrl}/${id}`);
  }
}