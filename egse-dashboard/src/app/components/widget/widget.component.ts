import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.css']
})
export class WidgetComponent {
  @Input() element!: any;

  cmdpar: any;
  cmdfather: string = '';
  selectOptions: string[] = [];
  widgetService: any;
  http: any;

  ngOnInit(): void {
    this.cmdpar = this.element.parameter ?? this.element.command ?? {};
    this.cmdfather = this.element.ccsdspacket ? this.element.ccsdspacket + ':' : '';

    if (this.element.graphical?.toLowerCase().startsWith('select')) {
      this.selectOptions = this.element.graphical.split(';').slice(1);
    }
  }

  get maxLength(): number {
    const matches = /(\d+)/.exec(this.cmdpar?.lengthRule || '');
    const value = matches ? Number(matches[1]) / 8 : 255;
    return isNaN(value) || value <= 0 ? 255 : value;
  }

  onCommand(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    console.log('SendCommand:', this.element.name, value);
  }

  onCommandDirect(): void {
    console.log('SendCommand:', this.element.name, this.cmdpar.value);
  }

  onSelectCommand(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedValue = select.value;
    const selectedIndex = select.selectedIndex;
    console.log('SendSelectCommand:', this.element.id, selectedValue, selectedIndex);
  }

  downloadList(): void {
    console.log('Download list:', this.element.name);
  }

  sendCommand(id: string, value: string): void {
    this.http.get(`http://localhost:8080/api/widget/command/${id}:${encodeURIComponent(value)}`)
      .subscribe({
        next: () => {
          console.log(`Command ${id} sent successfully.`);
        },
        error: () => {
          alert('404. Please wait until the File is Loaded.');
        }
      });
  }
  

  onNotify(id: string, result: string): void {
    const el = document.getElementById(id);
    if (!el) return;

    if (result === 'OK') {
      alert(el.title + '\nCommand executed successfully.');
    } else if (result === 'NOK') {
      alert(el.title + '\nERROR: Command not executed.');
    }
    // Altri casi come DISABLE, ENABLE, ecc. li puoi aggiungere qui
  }

}
