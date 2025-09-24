import { Injectable } from '@angular/core';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

@Injectable({
  providedIn: 'root'
})
export class IrisTrackerService {
  private faceMesh!: FaceMesh;

  constructor() {
    if (typeof window !== 'undefined') {
      this.faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
  
      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    }
  }
  

  startTracking(
    videoElement: HTMLVideoElement,
    onIrisMove: (x: number, y: number) => void
  ): void {
    if (!this.faceMesh) {
      console.error('FaceMesh non inizializzato');
      return;
    }
  
    this.faceMesh.onResults((results: { multiFaceLandmarks: string | any[] }) => {
      if (
        results.multiFaceLandmarks &&
        results.multiFaceLandmarks.length > 0
      ) {
        const landmarks = results.multiFaceLandmarks[0];
        const irisCenter = landmarks[468];
        onIrisMove(irisCenter.x, irisCenter.y);
      }
    });
  
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.faceMesh.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });
  
    camera.start();
  }
}
