import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private apiUrl = environment.apiUrl + '/audit-trail';

  constructor(private http: HttpClient) {}

  getAuditLogs(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

}