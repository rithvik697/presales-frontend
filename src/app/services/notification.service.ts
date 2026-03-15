import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:5000/api/notifications';

  constructor(private http: HttpClient) { }

  /**
   * Get notifications for the logged-in user
   */
  getNotifications(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {});
  }

}