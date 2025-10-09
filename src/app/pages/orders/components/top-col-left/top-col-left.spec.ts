import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopColLeft } from './top-col-left';

describe('TopColLeft', () => {
  let component: TopColLeft;
  let fixture: ComponentFixture<TopColLeft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopColLeft]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopColLeft);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
