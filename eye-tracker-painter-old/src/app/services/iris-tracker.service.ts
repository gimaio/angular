import { Injectable, NgZone } from '@angular/core';
import {
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

@Injectable({
  providedIn: 'root',
})
export class IrisTrackerService {
  private faceLandmarker!: FaceLandmarker;
  private video!: HTMLVideoElement;
  private running = false;

  private lastIris: { x: number; y: number } | null = null;

  constructor(private ngZone: NgZone) {}

  async initialize(video: HTMLVideoElement) {
    this.video = video;

    // Carica i file WASM e il modello
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/face_landmarker.task',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
    });

    this.running = true;
    this.startLoop();
  }

  private startLoop() {
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        if (!this.running) return;

        const now = performance.now();
        const result = this.faceLandmarker.detectForVideo(this.video, now);

        if (result && result.faceLandmarks?.length > 0) {
          const landmarks = result.faceLandmarks[0];
          const iris = landmarks[468]; // Punto dell'iride

          if (iris) {
            this.lastIris = { x: iris.x, y: iris.y };
          }
        }

        requestAnimationFrame(loop);
      };

      loop();
    });
  }

  getLastIris() {
    return this.lastIris;
  }

  stop() {
    this.running = false;
  }
}
