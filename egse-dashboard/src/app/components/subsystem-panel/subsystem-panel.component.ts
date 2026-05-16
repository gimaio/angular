import { Component, Input, OnInit } from '@angular/core';
import { SubsystemService } from '../../services/subsystem.service';
import { Subsystem } from '../../models/subsystem.model';
import { CommonModule } from '@angular/common';
import { WidgetComponent } from '../widget/widget.component';

@Component({
  selector: 'app-subsystem-panel',
  standalone: true,
  imports: [CommonModule,WidgetComponent],
  templateUrl: './subsystem-panel.component.html',
  styleUrls: ['./subsystem-panel.component.css']
})
export class SubsystemPanelComponent implements OnInit {
  @Input() code!: string;
  @Input() label!: string;

  subsystem?: Subsystem;

  constructor(private service: SubsystemService) {}

  ngOnInit(): void {
    this.service.getSubsystemData(this.code).subscribe(data => {
      console.log('Ricevuto:', data); // 👈 verifica nel browser
      this.subsystem = data[0];
    });
  }
}
