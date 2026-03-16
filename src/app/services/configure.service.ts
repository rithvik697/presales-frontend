import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface ProjectAssignment {
  mapping_id: number;
  emp_id: string;
  project_id: string;
  employee_name: string;
  project_name: string;
  created_on: string;
  created_by?: string;
}

export interface SalesExecutiveOption {
  emp_id: string;
  full_name: string;
}

export interface ProjectOption {
  project_id: string;
  project_name: string;
}

export interface LeadStatusOption {
  status_id: string;
  status_name: string;
  status_category?: string;
  description?: string;
  pipeline_order?: number;
}

export interface LeadSourceOption {
  source_id: string;
  source_name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigureService {
  private apiBase = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<ProjectOption[]> {
    return this.http.get<ProjectOption[]>(`${this.apiBase}/projects`);
  }

  getLeadStatuses(): Observable<LeadStatusOption[]> {
    return this.http.get<LeadStatusOption[]>(`${this.apiBase}/leads/statuses`);
  }

  createLeadStatus(payload: { status_name: string; description?: string; pipeline_order: number }): Observable<LeadStatusOption> {
    return this.http.post<LeadStatusOption>(`${this.apiBase}/leads/statuses`, payload);
  }

  deleteLeadStatus(statusId: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/leads/statuses/${statusId}`);
  }

  getLeadSources(): Observable<LeadSourceOption[]> {
    return this.http.get<LeadSourceOption[]>(`${this.apiBase}/leads/sources`);
  }

  createLeadSource(payload: { source_name: string; description?: string }): Observable<LeadSourceOption> {
    return this.http.post<LeadSourceOption>(`${this.apiBase}/leads/sources`, payload);
  }

  deleteLeadSource(sourceId: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/leads/sources/${sourceId}`);
  }

  getActiveSalesExecutives(): Observable<SalesExecutiveOption[]> {
    return this.http.get<any>(`${this.apiBase}/users`).pipe(
      map((response) => {
        const users = Array.isArray(response?.data) ? response.data : [];
        return users
          .filter((user: any) => user.role_id === 'SALES_EXEC' && user.emp_status === 'Active')
          .map((user: any) => ({
            emp_id: user.emp_id,
            full_name: [user.emp_first_name, user.emp_last_name].filter(Boolean).join(' ').trim()
          }))
          .sort((a: SalesExecutiveOption, b: SalesExecutiveOption) =>
            a.full_name.localeCompare(b.full_name)
          );
      })
    );
  }

  getProjectAssignments(): Observable<ProjectAssignment[]> {
    return this.http.get<ProjectAssignment[]>(`${this.apiBase}/config/project-assignments`);
  }

  createProjectAssignment(payload: { project_id: string; emp_id: string }): Observable<ProjectAssignment> {
    return this.http.post<ProjectAssignment>(`${this.apiBase}/config/project-assignments`, payload);
  }

  deleteProjectAssignment(mappingId: number): Observable<any> {
    return this.http.delete(`${this.apiBase}/config/project-assignments/${mappingId}`);
  }
}
