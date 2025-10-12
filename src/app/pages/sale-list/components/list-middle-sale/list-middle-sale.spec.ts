import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMiddleSale } from './list-middle-sale';

describe('ListMiddleSale', () => {
  let component: ListMiddleSale;
  let fixture: ComponentFixture<ListMiddleSale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListMiddleSale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMiddleSale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
