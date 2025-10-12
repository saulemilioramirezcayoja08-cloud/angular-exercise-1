import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBottomSale } from './list-bottom-sale';

describe('ListBottomSale', () => {
  let component: ListBottomSale;
  let fixture: ComponentFixture<ListBottomSale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListBottomSale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBottomSale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
