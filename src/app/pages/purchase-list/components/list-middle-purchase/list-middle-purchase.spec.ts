import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMiddlePurchase } from './list-middle-purchase';

describe('ListMiddlePurchase', () => {
  let component: ListMiddlePurchase;
  let fixture: ComponentFixture<ListMiddlePurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListMiddlePurchase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMiddlePurchase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
