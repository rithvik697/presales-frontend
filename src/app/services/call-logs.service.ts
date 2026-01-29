import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CallLogsService {

  private baseUrl = 'http://localhost:5000/api/calls';

  constructor(private http: HttpClient) {}

  getCallLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/logs`);
  }
}
