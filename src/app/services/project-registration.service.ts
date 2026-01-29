import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private baseUrl = 'http://127.0.0.1:5000/api/projects';

  constructor(private http: HttpClient) {}

  createProject(payload: any): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
}
