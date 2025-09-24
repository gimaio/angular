import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IrisTrackerService } from '../iris-tracker.service';

@Component({
  selector: 'app-eye-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eye-tracker.component.html',
  styleUrls: ['./eye-tracker.component.css'],
  providers: [IrisTrackerService]
})
export class EyeTrackerComponent implements AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  leftSymbol = '❤️';
  rightSymbol = '😊';
  selected = ''; // 'left' or 'right'
  symbols: string[] = [
    '😊','😢','😡','😨','😴','😋','🥤','❤️','😲','😐',
    '🤩','😕','😌','😳','😇','🤕','😂','🫣','🧐','🤗',
    '🍽️','🧸','📖','🚽','🛏️','🎵','👩‍🦰','👨‍🦰','🧑‍⚕️'
  ];

  emojiSounds: { [key: string]: string } = {
    '😊': 'felicità.mp3',
    '😢': 'tristezza.mp3',
    '😡': 'rabbia.mp3',
    '😨': 'paura.mp3',
    '😴': 'stanchezza.mp3',
    '😋': 'fame.mp3',
    '🥤': 'sete.mp3',
    '❤️': 'amore.mp3',
    '😲': 'sorpresa.mp3',
    '😐': 'noia.mp3',
    '🤩': 'entusiasmo.mp3',
    '😕': 'confusione.mp3',
    '😌': 'orgoglio.mp3',
    '😳': 'vergogna.mp3',
    '😇': 'calma.mp3',
    '🤕': 'dolore.mp3',
    '😂': 'gioia-intensa.mp3',
    '🫣': 'timidezza.mp3',
    '🧐': 'curiosità.mp3',
    '🤗': 'affetto.mp3',
    '🍽️': 'mangiare.mp3',
    '🧸': 'giocattolo.mp3',
    '📖': 'leggere.mp3',
    '🚽': 'bagno.mp3',
    '🛏️': 'dormire.mp3',
    '🎵': 'musica.mp3',
    '👩‍🦰': 'mamma.mp3',
    '👨‍🦰': 'papà.mp3',
    '🧑‍⚕️': 'dottore.mp3'
  };
  
  constructor(private irisTracker: IrisTrackerService) {}

  ngAfterViewInit(): void {
    this.irisTracker.startTracking(this.videoRef.nativeElement, (x, _) => {
      if (x < 0.4) {
        this.selected = 'right'; // guarda a sinistra → iride a destra
      } else if (x > 0.6) {
        this.selected = 'left';  // guarda a destra → iride a sinistra
      } else {
        this.selected = '';
      }      
    });
  }

  selectedSound: string = 'amore.mp3';

  lastPlayedSymbol: string | null = null;

  playSoundForSymbol(symbol: string) {
    const soundFile = this.emojiSounds[symbol];
    if (soundFile) {
      const audio = new Audio(`assets/sounds/${soundFile}`);
      audio.play().catch(err => console.error('Errore audio:', err));
    }
  }
  

  ngDoCheck() {
    let currentSymbol: string | null = null;
  
    if (this.selected === 'left') {
      currentSymbol = this.leftSymbol;
    } else if (this.selected === 'right') {
      currentSymbol = this.rightSymbol;
    }
  
    if (currentSymbol && currentSymbol !== this.lastPlayedSymbol) {
      this.lastPlayedSymbol = currentSymbol;
      this.playSoundForSymbol(currentSymbol);
    }
  }
  

  onSymbolFocus(symbol: string) {
    if (symbol !== this.lastPlayedSymbol) {
      this.lastPlayedSymbol = symbol;
      this.playSoundForSymbol(symbol);
    }
  }
  
}
