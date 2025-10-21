import { TestBed } from '@angular/core/testing';

import { OrderPrintMapper } from './order-print-mapper';

describe('OrderPrintMapper', () => {
  let service: OrderPrintMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderPrintMapper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
