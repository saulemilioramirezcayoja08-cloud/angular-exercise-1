import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Purchases } from './purchases';

describe('Purchases', () => {
  let component: Purchases;
  let fixture: ComponentFixture<Purchases>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Purchases]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Purchases);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
