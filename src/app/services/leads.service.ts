import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lead } from '../models/lead.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  // replace with your backend base url later
  private baseUrl = 'http://localhost:8000/api/leads';

  // State for UI persistence
  public filterViewOpen = false;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Lead[]> {
    // switch to: return this.http.get<Lead[]>(this.baseUrl);
    // temporary mock for frontend development:
    const mock: Lead[] = [
      {
        id: 'L001',
        name: 'Ravi Kumar',
        phone: '9876543210',
        project: 'Patio',
        source: 'Google',
        assignedTo: 'Anil',
      },
      {
        id: 'L002',
        name: 'Sita Devi',
        phone: '9123456789',
        project: 'Amity',
        source: 'Website',
        assignedTo: 'Kiran',
      },
    ];
    return of(mock);
  }

  getById(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.baseUrl}/${id}`);
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
}