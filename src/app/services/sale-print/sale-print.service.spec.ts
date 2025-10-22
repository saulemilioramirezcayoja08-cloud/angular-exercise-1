import { TestBed } from '@angular/core/testing';

import { SalePrintService } from './sale-print.service';

describe('SalePrintService', () => {
  let service: SalePrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalePrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
