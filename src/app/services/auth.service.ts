import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  login(payload: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, payload);
  }

  // --------------------------------------------------
  // CHANGE PASSWORD
  // --------------------------------------------------
  changePassword(payload: {
    old_password: string;
    new_password: string;
  }): Observable<any> {
    return this.http.put(`${this.API_URL}/change-password`, payload);
  }

  // --------------------------------------------------
  // SAVE TOKEN + DECODE PAYLOAD
  // --------------------------------------------------
  saveToken(token: string) {

    localStorage.setItem('access_token', token);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      localStorage.setItem('user_id', payload.sub);
      localStorage.setItem('role', payload.role_type);
      localStorage.setItem('username', payload.username);

    } catch (e) {
      console.error('Token decode failed', e);
    }
  }

  // --------------------------------------------------
  // TOKEN
  // --------------------------------------------------
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  }

  // --------------------------------------------------
  // USER DATA
  // --------------------------------------------------
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // --------------------------------------------------
  // ROLE HELPERS
  // --------------------------------------------------
  isAdmin(): boolean {
    return localStorage.getItem('role') === 'ADMIN';
  }

  isManager(): boolean {
    return localStorage.getItem('role') === 'SALES_MGR';
  }

  isSalesExec(): boolean {
    return localStorage.getItem('role') === 'SALES_EXEC';
  }

  // --------------------------------------------------
  // PASSWORD RESET
  // --------------------------------------------------
  forgotPassword(email: string) {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post(`${this.API_URL}/reset-password`, {
      token,
      password
    });
  }

}