import { TestBed } from '@angular/core/testing';

import { OrderState } from './order-state';

describe('OrderState', () => {
  let service: OrderState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
