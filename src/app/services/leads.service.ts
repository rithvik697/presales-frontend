import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lead } from '../models/lead.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  // Backend API URL
  private baseUrl = 'http://localhost:5000/api/leads';

  // State for UI persistence
  public filterViewOpen = false;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Lead[]> {
    return this.http.get<Lead[]>(this.baseUrl);
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

  getEmployees(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/employees`);
  }
}