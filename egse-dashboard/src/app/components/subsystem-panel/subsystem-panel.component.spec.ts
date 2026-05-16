import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsystemPanelComponent } from './subsystem-panel.component';

describe('SubsystemPanelComponent', () => {
  let component: SubsystemPanelComponent;
  let fixture: ComponentFixture<SubsystemPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsystemPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubsystemPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
