import { TestBed } from '@angular/core/testing';

import { QuotationState } from './quotation-state';

describe('QuotationState', () => {
  let service: QuotationState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuotationState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
