import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {
  FaceLandmarker,
  FilesetResolver
} from "@mediapipe/tasks-vision";

@Component({
  selector: 'app-painter',
  standalone: true,
  templateUrl: './painter.component.html',
  styleUrl: './painter.component.css'
})
export class PainterComponent implements AfterViewInit {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('video', { static: true })
  video!: ElementRef<HTMLVideoElement>;

  private ctx!: CanvasRenderingContext2D;

  faceLandmarker!: FaceLandmarker;
  running = false;

  eyeDrawingStarted = false;

  retentionSeconds = 5;
  strokes: { x: number, y: number, t: number }[] = [];

  // smoothing: numero di passate Chaikin (0–10)
  smoothFactor = 2;

  // limite massimo punti per evitare blocchi
  private readonly MAX_POINTS = 500;

  // throttling Mediapipe
  private lastDetectionTime = 0;
  private readonly DETECTION_INTERVAL_MS = 33; // ~30 FPS

  ngAfterViewInit(): void {
    const canvas = this.canvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.syncCanvasSize();

    window.addEventListener('resize', () => {
      this.syncCanvasSize();
      this.redrawCanvas();
    });

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => this.video.nativeElement.srcObject = stream);

    FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    ).then(async (resolver) => {
      this.faceLandmarker = await FaceLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
        },
        runningMode: "VIDEO",
        numFaces: 1
      });

      this.running = true;
      this.detectFace();
    });
  }

  syncCanvasSize() {
    const canvas = this.canvas.nativeElement;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    console.log("REAL SIZE:", canvas.width, canvas.height);
  }

  detectFace() {
    if (!this.running) return;

    const now = performance.now();

    // throttling Mediapipe
    if (now - this.lastDetectionTime >= this.DETECTION_INTERVAL_MS) {
      const video = this.video.nativeElement;
      const results = this.faceLandmarker.detectForVideo(video, now);
      this.lastDetectionTime = now;

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];

        const p = landmarks[468];
        const pos = this.mapToCanvas(p.x, p.y);

        if (!this.eyeDrawingStarted) {
          this.ctx.beginPath();
          this.ctx.moveTo(pos.x, pos.y);
          this.eyeDrawingStarted = true;
        }

        this.strokes.push({ x: pos.x, y: pos.y, t: now });

        // limite punti
        if (this.strokes.length > this.MAX_POINTS) {
          this.strokes.shift();
        }
      }
    }

    this.redrawCanvas();
    requestAnimationFrame(() => this.detectFace());
  }

  // Chaikin base
  chaikin(points: { x: number, y: number }[], factor: number) {
    if (points.length < 3) return points;

    const newPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      const Q = {
        x: p0.x + (p1.x - p0.x) * factor,
        y: p0.y + (p1.y - p0.y) * factor
      };

      const R = {
        x: p1.x - (p1.x - p0.x) * factor,
        y: p1.y - (p1.y - p0.y) * factor
      };

      newPoints.push(Q, R);
    }
    return newPoints;
  }

  // multipass Chaikin: smoothFactor = numero passate
  multiChaikin(points: { x: number, y: number }[], passes: number) {
    let result = points;
    const safePasses = Math.max(0, Math.min(10, passes)); // clamp 0–10
    for (let i = 0; i < safePasses; i++) {
      result = this.chaikin(result, 0.25);
    }
    return result;
  }

  redrawCanvas() {
    const canvas = this.canvas.nativeElement;
    const now = performance.now();

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cutoff = now - this.retentionSeconds * 1000;
    this.strokes = this.strokes.filter(s => s.t >= cutoff);

    if (this.strokes.length > 0) {
      const passes = Math.floor(this.smoothFactor);
      const smoothed = this.multiChaikin(this.strokes, passes);

      this.ctx.beginPath();
      this.ctx.moveTo(smoothed[0].x, smoothed[0].y);

      for (let i = 1; i < smoothed.length; i++) {
        this.ctx.lineTo(smoothed[i].x, smoothed[i].y);
      }

      this.ctx.stroke();
    }
  }

  mapToCanvas(x: number, y: number) {
    const canvas = this.canvas.nativeElement;
    return {
      x: (1 - x) * canvas.width,
      y: y * canvas.height
    };
  }

  changeColor(event: any) {
    this.ctx.strokeStyle = event.target.value;
  }

  changeSize(event: any) {
    this.ctx.lineWidth = event.target.value;
  }

  changeRetention(event: any) {
    this.retentionSeconds = Number(event.target.value);
  }

  changeSmoothing(event: any) {
    this.smoothFactor = Number(event.target.value);
  }

  saveCanvas() {
    const canvas = this.canvas.nativeElement;
    const dataUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'camilla-painter.png';
    link.click();
  }

  clearCanvas() {
    const canvas = this.canvas.nativeElement;

    this.strokes = [];
    this.eyeDrawingStarted = false;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
