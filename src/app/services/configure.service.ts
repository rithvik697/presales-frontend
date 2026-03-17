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
  emp_status?: string;
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

export interface LeadTransferPreview {
  lead_count: number;
}

export interface LeadTransferHistoryItem {
  transfer_id: number;
  lead_count: number;
  created_on: string;
  from_emp_id: string;
  to_emp_id: string;
  created_by: string;
  date_type?: string;
  from_date?: string;
  to_date?: string;
  from_employee_name?: string;
  to_employee_name?: string;
  created_by_name?: string;
  from_project_name?: string;
  from_source_name?: string;
  from_status_name?: string;
  to_project_name?: string;
  to_source_name?: string;
  to_status_name?: string;
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

  getSalesExecutives(activeOnly: boolean = true): Observable<SalesExecutiveOption[]> {
    return this.http.get<SalesExecutiveOption[]>(
      `${this.apiBase}/leads/employees?role=SALES_EXEC&active_only=${activeOnly}`
    ).pipe(
      map((users) =>
        users.sort((a, b) => a.full_name.localeCompare(b.full_name))
      )
    );
  }

  getActiveSalesExecutives(): Observable<SalesExecutiveOption[]> {
    return this.getSalesExecutives(true);
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

  previewLeadTransfer(payload: {
    from_emp_id: string;
    from_project_id?: string;
    from_source_id?: string;
    from_status_id?: string;
    date_type?: string;
    from_date?: string;
    to_date?: string;
  }): Observable<LeadTransferPreview> {
    return this.http.post<LeadTransferPreview>(`${this.apiBase}/config/lead-transfers/preview`, payload);
  }

  transferLeads(payload: {
    from_emp_id: string;
    to_emp_id: string;
    from_project_id?: string;
    from_source_id?: string;
    from_status_id?: string;
    to_project_id?: string;
    to_source_id?: string;
    to_status_id?: string;
    date_type?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
  }): Observable<{ transfer_id: number; lead_count: number; lead_ids: string[] }> {
    return this.http.post<{ transfer_id: number; lead_count: number; lead_ids: string[] }>(
      `${this.apiBase}/config/lead-transfers`,
      payload
    );
  }

  getLeadTransferHistory(): Observable<LeadTransferHistoryItem[]> {
    return this.http.get<LeadTransferHistoryItem[]>(`${this.apiBase}/config/lead-transfers/history`);
  }
}
