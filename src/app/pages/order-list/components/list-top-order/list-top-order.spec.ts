import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTopOrder } from './list-top-order';

describe('ListTopOrder', () => {
  let component: ListTopOrder;
  let fixture: ComponentFixture<ListTopOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListTopOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTopOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
