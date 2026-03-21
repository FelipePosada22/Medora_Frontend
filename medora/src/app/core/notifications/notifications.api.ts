import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { AppNotification } from './notifications.model';

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly base   = `${this.apiUrl}/notifications`;

  getAll(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.base);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/unread-count`);
  }

  markRead(id: string): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.base}/${id}/read`, {});
  }

  markAllRead(): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/read-all`, {});
  }
}
