import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePrint } from './sale-print';

describe('SalePrint', () => {
  let component: SalePrint;
  let fixture: ComponentFixture<SalePrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalePrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalePrint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
