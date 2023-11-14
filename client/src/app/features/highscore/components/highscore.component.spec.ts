import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighscoreComponent } from './highscore.component';

describe('HighscoreComponent', () => {
  let component: HighscoreComponent;
  let fixture: ComponentFixture<HighscoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HighscoreComponent]
    });
    fixture = TestBed.createComponent(HighscoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
