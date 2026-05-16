import { Component } from '@angular/core';
import { PainterComponent } from './painter/painter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PainterComponent],   // 👈 AGGIUNGI QUESTO
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'camilla-painter';
}
