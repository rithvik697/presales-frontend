import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CallLogsService {

  private baseUrl = environment.apiUrl + '/calls';

  constructor(private http: HttpClient) {}

  getCallLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ui`);
  }

  getRawCallLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/logs`);
  }

  click2Call(customerPhone: string, leadId?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/click2call`, {
      customer_phone: customerPhone,
      lead_id: leadId
    });
  }

  createManualLog(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/manual`, data);
  }

  updateCallLog(callId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${callId}`, data);
  }

  deleteCallLog(callId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${callId}`);
  }
}
