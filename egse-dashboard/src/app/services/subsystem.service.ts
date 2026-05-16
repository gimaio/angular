import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subsystem } from '../models/subsystem.model';

@Injectable({ providedIn: 'root' })
export class SubsystemService {
  constructor(private http: HttpClient) {}

  getSubsystemData(code: string): Observable<Subsystem[]> {
    return this.http.get<Subsystem[]>(`http://localhost:8080/api/widget/${code}`);
  }
}
