import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBottomPurchase } from './list-bottom-purchase';

describe('ListBottomPurchase', () => {
  let component: ListBottomPurchase;
  let fixture: ComponentFixture<ListBottomPurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListBottomPurchase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBottomPurchase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
