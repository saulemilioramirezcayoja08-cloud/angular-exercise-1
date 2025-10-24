import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SupplierCreateRequest } from './models/supplier-create-request.model';
import { SupplierCreateResponse } from './models/supplier-create-response.model';
import { Observable } from 'rxjs';
import { SupplierDetailResponse } from './models/supplier-detail-response.model';
import { SupplierPageResponse } from './models/supplier-page-response.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly baseUrl = 'http://192.168.0.156:8080/api/suppliers';

  constructor(private http: HttpClient) {
  }

  create(supplier: SupplierCreateRequest): Observable<SupplierCreateResponse> {
    return this.http.post<SupplierCreateResponse>(this.baseUrl, supplier);
  }

  getById(id: number): Observable<SupplierDetailResponse> {
    return this.http.get<SupplierDetailResponse>(`${this.baseUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'asc'): Observable<SupplierPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<SupplierPageResponse>(this.baseUrl, { params });
  }

  searchByName(name: string, page: number = 0, size: number = 10, sortBy: string = 'name', sortDir: string = 'asc'): Observable<SupplierPageResponse> {
    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<SupplierPageResponse>(`${this.baseUrl}/search`, { params });
  }
}
