import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingScreenComponent } from './billing-screen.component';

describe('BillingScreenComponent', () => {
  let component: BillingScreenComponent;
  let fixture: ComponentFixture<BillingScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BillingScreenComponent]
    });
    fixture = TestBed.createComponent(BillingScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
