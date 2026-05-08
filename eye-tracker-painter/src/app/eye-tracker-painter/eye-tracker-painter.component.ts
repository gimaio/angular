import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IrisTrackerService } from '../services/iris-tracker.service';

@Component({
  selector: 'app-eye-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eye-tracker-painter.component.html',
  styleUrls: ['./eye-tracker-painter.component.css']
})
export class EyeTrackerComponent implements AfterViewInit {

  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('drawCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  // Ultima posizione disegnata
  private lastX: number | null = null;
  private lastY: number | null = null;

  // -------------------------
  // 🎨 PALETTE
  // -------------------------
  paletteOpen = false;

  colors = ['blue', 'red', 'green', 'yellow', 'purple', 'black', 'orange'];
  lineWidth = 14; // tratto iniziale più grosso

  togglePalette() {
    this.paletteOpen = !this.paletteOpen;
  }

  setColor(c: string) {
    this.ctx.strokeStyle = c;
  }

  updateLineWidth() {
    this.ctx.lineWidth = this.lineWidth;
  }

  // -------------------------
  // ⚡ SENSIBILITÀ MOVIMENTO PUPILLA
  // -------------------------
  private smoothX = 0;
  private smoothY = 0;
  private smoothing = 0.25; // più basso = più reattivo
  private gain = 4;       // amplifica il movimento

  // -------------------------
  // 👁️ BLINK DETECTION
  // -------------------------
  private eyeWasClosed = false;
  private blinkTimes: number[] = [];

  constructor(private irisService: IrisTrackerService) {}

  ngAfterViewInit() {
    this.irisService.startTracking(this.videoRef.nativeElement);

    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = 'blue';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Disegno
    this.irisService.irisPosition$.subscribe(pos => {
      if (pos) {
        this.drawFromIris(pos.x, pos.y);
      } else {
        this.lastX = null;
        this.lastY = null;
      }
    });

    // Blink detection
    this.irisService.eyeClosed$.subscribe(closed => {
      this.detectBlink(closed);
    });
  }

  private drawFromIris(x: number, y: number) {

    // -------------------------
    // ⚡ SMOOTHING + GAIN
    // -------------------------
    this.smoothX = this.smoothX + (x - this.smoothX) * this.smoothing;
    this.smoothY = this.smoothY + (y - this.smoothY) * this.smoothing;

    const centeredX = (this.smoothX - 0.5) * this.gain + 0.5;
    const centeredY = (this.smoothY - 0.5) * this.gain + 0.5;

    const canvasX = (1 - centeredX) * window.innerWidth;
    const canvasY = centeredY * window.innerHeight;

    // Primo punto dopo un buco
    if (this.lastX === null || this.lastY === null) {
      this.lastX = canvasX;
      this.lastY = canvasY;
      return;
    }

    // Disegno
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(canvasX, canvasY);
    this.ctx.stroke();

    this.lastX = canvasX;
    this.lastY = canvasY;
  }

  private detectBlink(closed: boolean) {
    const now = Date.now();

    if (closed && !this.eyeWasClosed) {
      this.eyeWasClosed = true;
    }

    if (!closed && this.eyeWasClosed) {
      this.eyeWasClosed = false;

      this.blinkTimes.push(now);
      if (this.blinkTimes.length > 2) this.blinkTimes.shift();

      if (this.blinkTimes.length === 2) {
        const interval = this.blinkTimes[1] - this.blinkTimes[0];

        if (interval < 500) {
          this.clearCanvas();
          this.blinkTimes = [];
        }
      }
    }
  }

  private clearCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.lastX = null;
    this.lastY = null;
  }
}
