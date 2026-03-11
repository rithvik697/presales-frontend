import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private baseUrl = 'http://127.0.0.1:5000/api/projects';

  constructor(private http: HttpClient) {}

  // -----------------------------
  // Create Project
  // -----------------------------
  createProject(payload: any): Observable<any> {

    const username = localStorage.getItem('username');

    payload.created_by = username || 'ADMIN';

    return this.http.post(this.baseUrl, payload);
  }

  // -----------------------------
  // Get All Projects
  // -----------------------------
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // -----------------------------
  // Get Project By ID
  // -----------------------------
  getProjectById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // -----------------------------
  // Update Project Details
  // -----------------------------
  updateProject(id: string, payload: any): Observable<any> {

    const username = localStorage.getItem('username');

    payload.modified_by = username || 'ADMIN';

    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  // -----------------------------
  // Update Project Status
  // -----------------------------
  updateProjectStatus(id: string, status: string): Observable<any> {

    const username = localStorage.getItem('username');

    return this.http.put<any>(`${this.baseUrl}/${id}/status`, {
      status: status,
      modified_by: username || 'ADMIN'
    });

  }

  // -----------------------------
  // Get Status Options
  // -----------------------------
  getProjectStatusOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/status-options`);
  }

  // -----------------------------
  // Get Project Type Options
  // -----------------------------
  getProjectTypeOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/type-options`);
  }

}