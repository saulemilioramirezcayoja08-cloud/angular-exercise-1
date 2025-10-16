import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleHistory } from './sale-history';

describe('SaleHistory', () => {
  let component: SaleHistory;
  let fixture: ComponentFixture<SaleHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaleHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
