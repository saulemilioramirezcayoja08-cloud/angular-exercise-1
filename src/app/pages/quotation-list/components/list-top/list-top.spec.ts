import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTop } from './list-top';

describe('ListTop', () => {
  let component: ListTop;
  let fixture: ComponentFixture<ListTop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListTop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
