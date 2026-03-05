import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lead } from '../models/lead.model';
import { LeadStatusHistory, StatusOption } from '../models/lead-status-history.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private baseUrl = 'http://localhost:5000/api/leads';

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
    return this.http.get<any[]>('http://localhost:5000/api/projects');
  }

  getSources(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sources`);
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

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employees`);
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