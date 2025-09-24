import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EyeTrackerComponent } from './eye-tracker.component';

describe('EyeTrackerComponent', () => {
  let component: EyeTrackerComponent;
  let fixture: ComponentFixture<EyeTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EyeTrackerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EyeTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
