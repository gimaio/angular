import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IrisTrackerService } from '../services/iris-tracker.service';

@Component({
  selector: 'app-eye-tracker-painter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eye-tracker-painter.component.html',
  styleUrls: ['./eye-tracker-painter.component.css']
})
export class EyeTrackerPainterComponent implements AfterViewInit {



  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  paletteOpen = false;
  selectedColor = '#ff0000';
  lineWidth = 6;

  private ctx!: CanvasRenderingContext2D;
  private lastX: number | null = null;
  private lastY: number | null = null;

  constructor(private irisService: IrisTrackerService) {}

  async ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    this.ctx = canvas.getContext('2d')!;
    canvas.width = 640;
    canvas.height = 480;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });

    video.srcObject = stream;
    await video.play();

    await this.irisService.initialize(video);

    this.startDrawingLoop();
  }

  togglePalette() {
    this.paletteOpen = !this.paletteOpen;
  }

  setColor(color: string) {
    this.selectedColor = color;
  }

  updateLineWidth() {
    // già aggiornato da ngModel
  }

  private startDrawingLoop() {
    const draw = (): void => {
      const iris = this.irisService.getLastIris();
  
      if (iris) {
        const x = iris.x * 640;
        const y = iris.y * 480;
  
        if (this.lastX == null || this.lastY == null) {
          this.lastX = x;
          this.lastY = y;
          requestAnimationFrame(draw);
          return;
        }
  
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.stroke();
  
        this.lastX = x;
        this.lastY = y;
      }
  
      requestAnimationFrame(draw);
    };
  
    draw();
  }

  

  
  
}
