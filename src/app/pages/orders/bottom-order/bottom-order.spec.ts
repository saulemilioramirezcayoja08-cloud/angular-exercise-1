import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomOrder } from './bottom-order';

describe('BottomOrder', () => {
  let component: BottomOrder;
  let fixture: ComponentFixture<BottomOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BottomOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
