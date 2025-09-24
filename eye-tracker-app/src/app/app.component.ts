import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EyeTrackerComponent } from "./eye-tracker/eye-tracker.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EyeTrackerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'eye-tracker-app';
}
