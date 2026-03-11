import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  login(payload: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, payload);
  }

  changePassword(payload: {
  old_password: string;
  new_password: string;
  }): Observable<any> {
    return this.http.put(`${this.API_URL}/change-password`, payload);
  }
  
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
  }
   getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }
}