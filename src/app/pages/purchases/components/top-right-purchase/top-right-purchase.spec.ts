import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopRightPurchase } from './top-right-purchase';

describe('TopRightPurchase', () => {
  let component: TopRightPurchase;
  let fixture: ComponentFixture<TopRightPurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopRightPurchase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopRightPurchase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
