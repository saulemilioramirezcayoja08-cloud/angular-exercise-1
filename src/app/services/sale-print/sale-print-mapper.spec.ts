import { TestBed } from '@angular/core/testing';

import { SalePrintMapper } from './sale-print-mapper';

describe('SalePrintMapper', () => {
  let service: SalePrintMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalePrintMapper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
