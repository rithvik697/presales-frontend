import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {

  private apiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

  /* ================= REGISTER USER ================= */
  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /* ================= GET ALL USERS ================= */
  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /* ================= GET USER BY ID ================= */
  getUserById(empId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${empId}`);
  }

  /* ================= UPDATE USER ================= */
  updateUser(empId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${empId}`, data);
  }

  /* ================= UPDATE USER STATUS (TOGGLE) ================= */
  updateStatus(empId: string, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${empId}/status`,
      { emp_status: status }
    );
  }

  /* ================= DELETE USER ================= */
  deleteUser(empId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${empId}`);
  }

}