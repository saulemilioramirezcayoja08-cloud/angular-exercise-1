import { TestBed } from '@angular/core/testing';

import { QuotationPrintService } from './quotation-print-service';

describe('QuotationPrintService', () => {
  let service: QuotationPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuotationPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
