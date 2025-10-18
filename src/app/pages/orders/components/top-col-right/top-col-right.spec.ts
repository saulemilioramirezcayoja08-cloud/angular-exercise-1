import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopColRight } from './top-col-right';

describe('TopColRight', () => {
  let component: TopColRight;
  let fixture: ComponentFixture<TopColRight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopColRight]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopColRight);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
