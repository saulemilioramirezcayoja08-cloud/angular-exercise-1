import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bottom } from './bottom';

describe('Bottom', () => {
  let component: Bottom;
  let fixture: ComponentFixture<Bottom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Bottom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bottom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
