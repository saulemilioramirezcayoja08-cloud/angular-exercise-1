import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SalePrintData } from './models/sale-print-data.model';

@Injectable({
  providedIn: 'root'
})
export class SalePrintService {
  private printDataSubject = new BehaviorSubject<SalePrintData | null>(null);

  getPrintData(): Observable<SalePrintData | null> {
    return this.printDataSubject.asObservable();
  }

  setPrintData(data: SalePrintData): void {
    this.printDataSubject.next(data);
  }

  clearPrintData(): void {
    this.printDataSubject.next(null);
  }
}