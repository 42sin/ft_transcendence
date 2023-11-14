import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertBoxComponent } from './alert-box.component';

describe('SlidingAlertBoxComponent', () => {
  let component: AlertBoxComponent;
  let fixture: ComponentFixture<AlertBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlertBoxComponent]
    });
    fixture = TestBed.createComponent(AlertBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
