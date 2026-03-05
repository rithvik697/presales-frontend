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

    const username = localStorage.getItem('username');

    data.created_by = username || 'ADMIN';

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

    const username = localStorage.getItem('username');

    data.modified_by = username || 'ADMIN';

    return this.http.put(`${this.apiUrl}/${empId}`, data);
  }

  /* ================= UPDATE USER STATUS (TOGGLE) ================= */
  updateStatus(empId: string, status: string): Observable<any> {

    const username = localStorage.getItem('username');

    return this.http.put(
      `${this.apiUrl}/${empId}/status`,
      {
        emp_status: status,
        modified_by: username || 'ADMIN'
      }
    );
  }

  /* ================= DELETE USER ================= */
  deleteUser(empId: string): Observable<any> {

    const username = localStorage.getItem('username');

    return this.http.delete(
      `${this.apiUrl}/${empId}`,
      {
        body: { modified_by: username || 'ADMIN' }
      }
    );
  }

}