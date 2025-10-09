import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiddleOrder } from './middle-order';

describe('MiddleOrder', () => {
  let component: MiddleOrder;
  let fixture: ComponentFixture<MiddleOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiddleOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiddleOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
