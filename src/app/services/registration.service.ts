import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
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

  /* ================= UPDATE USER STATUS ================= */
  updateUserStatus(empId: string, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${empId}/status`,
      { emp_status: status }
    );
  }

}
