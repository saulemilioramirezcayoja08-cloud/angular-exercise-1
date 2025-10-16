import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAvailability } from './stock-availability';

describe('StockAvailability', () => {
  let component: StockAvailability;
  let fixture: ComponentFixture<StockAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockAvailability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
