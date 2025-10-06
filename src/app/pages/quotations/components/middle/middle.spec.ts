import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Middle } from './middle';

describe('Middle', () => {
  let component: Middle;
  let fixture: ComponentFixture<Middle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Middle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Middle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
