import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quotations } from './quotations';

describe('Quotations', () => {
  let component: Quotations;
  let fixture: ComponentFixture<Quotations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Quotations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Quotations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
