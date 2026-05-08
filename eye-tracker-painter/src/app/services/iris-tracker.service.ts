import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FaceMesh } from '@mediapipe/face_mesh';

@Injectable({
  providedIn: 'root'
})
export class IrisTrackerService {

  irisPosition$ = new BehaviorSubject<{x: number, y: number} | null>(null);
  eyeClosed$ = new BehaviorSubject<boolean>(false);

  private faceMesh!: FaceMesh;

  startTracking(video: HTMLVideoElement) {
    this.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.faceMesh.onResults(results => this.processResults(results));

    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      video.srcObject = stream;
      video.play();

      const loop = () => {
        this.faceMesh.send({ image: video });
        requestAnimationFrame(loop);
      };
      loop();
    });
  }

  private processResults(results: any) {
    if (!results.multiFaceLandmarks?.length) return;

    const lm = results.multiFaceLandmarks[0];

    const iris = lm[468];
    this.irisPosition$.next({ x: iris.x, y: iris.y });

    const top = lm[159];
    const bottom = lm[145];
    // EAR threshold più stabile
    const dy = Math.abs(top.y - bottom.y);

    // Occhio chiuso solo se molto chiuso
    const closed = dy < 0.008;

    // Evita oscillazioni
    this.eyeClosed$.next(closed);

  }
}
