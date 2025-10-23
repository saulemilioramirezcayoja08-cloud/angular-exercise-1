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

  numberToWords(amount: number): string {
    if (amount === 0) return 'Cero 00/100 Bs.';

    const units = ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
    const teens = ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'];
    const tens = ['', '', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
    const hundreds = ['', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];

    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 100);

    const convertGroup = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        const ten = Math.floor(n / 10);
        const unit = n % 10;
        if (unit === 0) return tens[ten];
        if (n < 30) return `Veinti${units[unit].toLowerCase()}`;
        return `${tens[ten]} y ${units[unit]}`;
      }

      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      const hundredWord = n === 100 ? 'Cien' : hundreds[hundred];
      return rest === 0 ? hundredWord : `${hundredWord} ${convertGroup(rest)}`;
    };

    const convertThousands = (n: number): string => {
      if (n === 0) return '';
      if (n < 1000) return convertGroup(n);

      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;

      let result = '';
      if (thousands === 1) {
        result = 'Mil';
      } else {
        result = `${convertGroup(thousands)} Mil`;
      }

      if (rest > 0) {
        result += ` ${convertGroup(rest)}`;
      }

      return result;
    };

    const convertMillions = (n: number): string => {
      if (n < 1000000) return convertThousands(n);

      const millions = Math.floor(n / 1000000);
      const rest = n % 1000000;

      let result = '';
      if (millions === 1) {
        result = 'Un Millón';
      } else {
        result = `${convertGroup(millions)} Millones`;
      }

      if (rest > 0) {
        result += ` ${convertThousands(rest)}`;
      }

      return result;
    };

    const words = convertMillions(integerPart).trim();
    const decimalStr = decimalPart.toString().padStart(2, '0');

    return `${words} ${decimalStr}/100 Bs.`;
  }
}
