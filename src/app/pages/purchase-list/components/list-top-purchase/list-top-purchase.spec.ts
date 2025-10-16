import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTopPurchase } from './list-top-purchase';

describe('ListTopPurchase', () => {
  let component: ListTopPurchase;
  let fixture: ComponentFixture<ListTopPurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListTopPurchase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTopPurchase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
