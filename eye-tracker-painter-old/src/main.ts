import { bootstrapApplication } from '@angular/platform-browser';
import { EyeTrackerPainterComponent } from './app/eye-tracker-painter/eye-tracker-painter.component';

bootstrapApplication(EyeTrackerPainterComponent)
  .catch(err => console.error(err));
