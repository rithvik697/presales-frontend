import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lead } from '../models/lead.model';
import { LeadStatusHistory, StatusOption } from '../models/lead-status-history.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private baseUrl = environment.apiUrl + '/leads';

  public filterViewOpen = false;

  constructor(private http: HttpClient) { }

  // ─── Existing Lead CRUD (unchanged) ───────────────────────

  getAll(): Observable<Lead[]> {
    return this.http.get<Lead[]>(this.baseUrl);
  }

  getById(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.baseUrl}/${id}`);
  }

  getProjects() {
    return this.http.get<any[]>(environment.apiUrl + '/projects');
  }

  getSources(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sources`);
  }

  getCountryCodes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/country-codes`);
  }

  getStatuses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/statuses`);
  }

  create(lead: Lead): Observable<Lead> {
    return this.http.post<Lead>(this.baseUrl, lead);
  }

  update(id: string, lead: Lead) {
    return this.http.put<Lead>(`${this.baseUrl}/${id}`, lead);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getEmployees(role?: string): Observable<any[]> {
    const url = role
      ? `${this.baseUrl}/employees?role=${encodeURIComponent(role)}`
      : `${this.baseUrl}/employees`;
    return this.http.get<any[]>(url);
  }

  // ─── Status History (Timeline) ────────────────────────────

  getStatusHistory(leadId: string): Observable<LeadStatusHistory[]> {
    return this.http.get<LeadStatusHistory[]>(
      `${this.baseUrl}/${leadId}/status-history`
    );
  }

  createStatusChange(leadId: string, data: { new_status_id: string; remarks?: string }): Observable<LeadStatusHistory> {
    return this.http.post<LeadStatusHistory>(
      `${this.baseUrl}/${leadId}/status-history`, data
    );
  }

  scheduleActivity(leadId: string, data: { status_id: string; scheduled_at: string; remarks?: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${leadId}/scheduled-activities`, data
    );
  }

  addComment(leadId: string, data: { comment_text: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${leadId}/comments`, data
    );
  }

  getCallHistory(leadId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/calls/ui/lead/${leadId}`
    );
  }

  updateStatusHistory(leadId: string, historyId: number, data: { remarks: string }): Observable<LeadStatusHistory> {
    return this.http.put<LeadStatusHistory>(
      `${this.baseUrl}/${leadId}/status-history/${historyId}`, data
    );
  }

  deleteStatusHistory(leadId: string, historyId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${leadId}/status-history/${historyId}`
    );
  }
}
