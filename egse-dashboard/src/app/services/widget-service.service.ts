import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class WidgetService {
  notify(measure: string, val: string): void {
    const el = document.getElementById(measure);
    if (!el) return;

    if (val === 'OK') {
      alert(el.title + '\nCommand executed successfully.');
    } else if (val === 'NOK') {
      alert(el.title + '\nERROR: Command not executed.');
    } else if (val === 'DISABLE') {
      el.setAttribute('disabled', 'true');
      document.getElementById('but' + measure)?.setAttribute('disabled', 'true');
    } else if (val === 'ENABLE') {
      el.removeAttribute('disabled');
      document.getElementById('but' + measure)?.removeAttribute('disabled');
    } else if (val === 'HIDDEN') {
      let x = el.parentElement;
      if (x?.className === 'gauge-body') {
        const parent = x.parentElement?.parentElement;
        if (parent) x = parent;
      }
      
      if (x) x.style.display = 'none';
    } else if (val.startsWith('ANSWER-')) {
      const question = val.split('-')[1];
      const response = prompt(`Please type ${question} (${val})`);
      if (response) this.sendCommand(measure, response);
    } else if (val.startsWith('INFO-')) {
      alert('INFO: ' + val.split('-')[1]);
    } else if (val.startsWith('CONFIRM-')) {
      const confirmText = val.split('-')[1];
      const response = confirm(confirmText + '. Please confirm.');
      this.sendCommand(measure, response ? 'YES' : 'NO');
    } else if (document.getElementById(measure + 'seldyn')?.tagName === 'SELECT') {
      this.updateDynamicSelect(measure, val);
    } else {
      el.setAttribute('value', val);
      (el as HTMLInputElement).value = val;
      console.log(measure + ' = ' + val);
    }
  }

  sendCommand(id: string, value: string): void {
    // Replace with HttpClient in real Angular app
    console.log('Sending command:', id, value);
  }

  updateDynamicSelect(measure: string, val: string): void {
    const select = document.getElementById(measure + 'seldyn') as HTMLSelectElement;
    if (!select) return;

    const options = val.split('|');
    select.innerHTML = '';
    let selectedIndex = 0;

    options.forEach((opt, i) => {
      if (opt.endsWith('***')) {
        selectedIndex = i;
        opt = opt.slice(0, -3);
      }
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });

    select.selectedIndex = selectedIndex;
  }
}
