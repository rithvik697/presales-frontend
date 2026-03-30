import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  role_id?: string;
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

export interface BulkUploadRowResult {
  row_number: number;
  lead_id?: string;
  assigned_to?: string;
  phone?: string;
  reason?: string;
}

export interface BulkUploadResult {
  upload_id: number;
  file_name: string;
  total_rows: number;
  created_count: number;
  duplicate_count: number;
  failed_count: number;
  expected_columns: string[];
  created_leads: BulkUploadRowResult[];
  duplicate_rows: BulkUploadRowResult[];
  failed_rows: BulkUploadRowResult[];
}

export interface BulkUploadHistoryItem {
  upload_id: number;
  file_name: string;
  total_rows: number;
  created_count: number;
  duplicate_count: number;
  failed_count: number;
  uploaded_by: string;
  uploaded_on: string;
}

export interface ReportEmailRecipient {
  id: number;
  recipient_name: string;
  email: string;
  weekly_report: boolean;
  monthly_report: boolean;
  quarterly_report: boolean;
  annual_report: boolean;
  is_active: boolean;
  created_by: string;
  created_on: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigureService {
  private apiBase = environment.apiUrl;

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

  getAdmins(activeOnly: boolean = true): Observable<SalesExecutiveOption[]> {
    return this.http.get<SalesExecutiveOption[]>(
      `${this.apiBase}/leads/employees?role=ADMIN&active_only=${activeOnly}`
    ).pipe(
      map((users) =>
        users.sort((a, b) => a.full_name.localeCompare(b.full_name))
      )
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

  uploadBulkLeads(file: File): Observable<BulkUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BulkUploadResult>(`${this.apiBase}/config/bulk-leads/upload`, formData);
  }

  getBulkUploadHistory(): Observable<BulkUploadHistoryItem[]> {
    return this.http.get<BulkUploadHistoryItem[]>(`${this.apiBase}/config/bulk-leads/history`);
  }

  // Report Email Recipients
  getReportEmailRecipients(): Observable<ReportEmailRecipient[]> {
    return this.http.get<ReportEmailRecipient[]>(`${this.apiBase}/config/report-emails`);
  }

  addReportEmailRecipient(payload: {
    recipient_name: string;
    email: string;
    weekly_report: boolean;
    monthly_report: boolean;
    quarterly_report: boolean;
    annual_report: boolean;
  }): Observable<any> {
    return this.http.post(`${this.apiBase}/config/report-emails`, payload);
  }

  updateReportEmailRecipient(id: number, payload: Record<string, boolean>): Observable<any> {
    return this.http.put(`${this.apiBase}/config/report-emails/${id}`, payload);
  }

  deleteReportEmailRecipient(id: number): Observable<any> {
    return this.http.delete(`${this.apiBase}/config/report-emails/${id}`);
  }
}
