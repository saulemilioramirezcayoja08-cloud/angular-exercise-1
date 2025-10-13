import { TestBed } from '@angular/core/testing';

import { OrderPrintService } from './order-print.service';

describe('OrderPrintService', () => {
  let service: OrderPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
