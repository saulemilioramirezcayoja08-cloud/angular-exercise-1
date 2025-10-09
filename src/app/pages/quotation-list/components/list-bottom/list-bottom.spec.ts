import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBottom } from './list-bottom';

describe('ListBottom', () => {
  let component: ListBottom;
  let fixture: ComponentFixture<ListBottom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListBottom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBottom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
