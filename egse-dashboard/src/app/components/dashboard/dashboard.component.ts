import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubsystemPanelComponent } from '../subsystem-panel/subsystem-panel.component'; // verifica il percorso

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SubsystemPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  subsystems = [
    { code: 'ao', label: 'AOM Manager' },
    { code: 'gn', label: 'GNC' },
    { code: 'ob', label: 'OBDH' },
    { code: 'um', label: 'UMB' }
  ];

  ngOnInit(): void {}
}
