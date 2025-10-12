import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBottomOrder } from './list-bottom-order';

describe('ListBottomOrder', () => {
  let component: ListBottomOrder;
  let fixture: ComponentFixture<ListBottomOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListBottomOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBottomOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
