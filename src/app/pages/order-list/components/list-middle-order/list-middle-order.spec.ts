import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMiddleOrder } from './list-middle-order';

describe('ListMiddleOrder', () => {
  let component: ListMiddleOrder;
  let fixture: ComponentFixture<ListMiddleOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListMiddleOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMiddleOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
