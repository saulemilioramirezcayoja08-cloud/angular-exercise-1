import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftTop } from './left-top';

describe('LeftTop', () => {
  let component: LeftTop;
  let fixture: ComponentFixture<LeftTop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeftTop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftTop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
