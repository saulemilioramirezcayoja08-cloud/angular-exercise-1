import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiddlePurchase } from './middle-purchase';

describe('MiddlePurchase', () => {
  let component: MiddlePurchase;
  let fixture: ComponentFixture<MiddlePurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiddlePurchase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiddlePurchase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
