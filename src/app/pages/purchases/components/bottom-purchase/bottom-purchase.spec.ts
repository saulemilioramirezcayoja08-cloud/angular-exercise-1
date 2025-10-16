import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomPurchase } from './bottom-purchase';

describe('BottomPurchase', () => {
  let component: BottomPurchase;
  let fixture: ComponentFixture<BottomPurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BottomPurchase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomPurchase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
