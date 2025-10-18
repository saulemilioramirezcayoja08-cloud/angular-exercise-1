import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopLeftPurchase } from './top-left-purchase';

describe('TopLeftPurchase', () => {
  let component: TopLeftPurchase;
  let fixture: ComponentFixture<TopLeftPurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopLeftPurchase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopLeftPurchase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
