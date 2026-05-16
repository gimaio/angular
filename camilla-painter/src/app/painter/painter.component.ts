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

    const video = this.video.nativeElement;
    const results = this.faceLandmarker.detectForVideo(video, performance.now());

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];

      const p = landmarks[468];
      const pos = this.mapToCanvas(p.x, p.y);

      if (!this.eyeDrawingStarted) {
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.eyeDrawingStarted = true;
      }

      this.strokes.push({ x: pos.x, y: pos.y, t: performance.now() });
    }

    this.redrawCanvas();
    requestAnimationFrame(() => this.detectFace());
  }

  redrawCanvas() {
    const canvas = this.canvas.nativeElement;
    const now = performance.now();

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cutoff = now - this.retentionSeconds * 1000;
    this.strokes = this.strokes.filter(s => s.t >= cutoff);

    if (this.strokes.length > 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.strokes[0].x, this.strokes[0].y);

      for (let i = 1; i < this.strokes.length; i++) {
        this.ctx.lineTo(this.strokes[i].x, this.strokes[i].y);
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

  clearCanvas() {
    const canvas = this.canvas.nativeElement;

    this.strokes = [];
    this.eyeDrawingStarted = false;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
