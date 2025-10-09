import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMiddle } from './list-middle';

describe('ListMiddle', () => {
  let component: ListMiddle;
  let fixture: ComponentFixture<ListMiddle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListMiddle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMiddle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
