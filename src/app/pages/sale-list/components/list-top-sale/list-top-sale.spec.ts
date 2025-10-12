import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTopSale } from './list-top-sale';

describe('ListTopSale', () => {
  let component: ListTopSale;
  let fixture: ComponentFixture<ListTopSale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListTopSale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTopSale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
