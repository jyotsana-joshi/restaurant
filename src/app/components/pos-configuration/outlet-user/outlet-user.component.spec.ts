import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletUserComponent } from './outlet-user.component';

describe('OutletUserComponent', () => {
  let component: OutletUserComponent;
  let fixture: ComponentFixture<OutletUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OutletUserComponent]
    });
    fixture = TestBed.createComponent(OutletUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
