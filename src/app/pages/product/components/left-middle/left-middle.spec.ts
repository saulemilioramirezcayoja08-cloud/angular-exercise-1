import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftMiddle } from './left-middle';

describe('LeftMiddle', () => {
  let component: LeftMiddle;
  let fixture: ComponentFixture<LeftMiddle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeftMiddle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftMiddle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
