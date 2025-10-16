import { TestBed } from '@angular/core/testing';

import { PurchaseState } from './purchase-state';

describe('PurchaseState', () => {
  let service: PurchaseState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
