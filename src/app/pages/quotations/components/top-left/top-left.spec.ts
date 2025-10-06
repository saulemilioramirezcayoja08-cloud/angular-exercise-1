import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopLeft } from './top-left';

describe('TopLeft', () => {
  let component: TopLeft;
  let fixture: ComponentFixture<TopLeft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopLeft]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopLeft);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
