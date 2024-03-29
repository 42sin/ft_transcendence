import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmBoxComponent } from './confirm-box.component';

describe('SlidingConfirmBoxComponent', () => {
  let component: ConfirmBoxComponent;
  let fixture: ComponentFixture<ConfirmBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmBoxComponent]
    });
    fixture = TestBed.createComponent(ConfirmBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
