import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { interval, startWith, switchMap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationsApi } from './notifications.api';
import { AppNotification } from './notifications.model';

const POLL_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api    = inject(NotificationsApi);
  private readonly router = inject(Router);

  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount   = signal(0);
  readonly isOpen        = signal(false);
  readonly isLoading     = signal(false);

  constructor() {
    interval(POLL_MS)
      .pipe(
        startWith(0),
        switchMap(() => this.api.getUnreadCount().pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(),
      )
      .subscribe(res => this.unreadCount.set(res.count));
  }

  toggle(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
    } else {
      this.isOpen.set(true);
      this._loadList();
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  markRead(notification: AppNotification): void {
    if (!notification.isRead) {
      this.api.markRead(notification.id).subscribe({
        next: updated => {
          this.notifications.update(list => list.map(n => n.id === updated.id ? updated : n));
          this.unreadCount.update(c => Math.max(0, c - 1));
        },
      });
    }
    this._navigate(notification);
    this.close();
  }

  markAllRead(): void {
    this.api.markAllRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      },
    });
  }

  private _loadList(): void {
    this.isLoading.set(true);
    this.api.getAll().subscribe({
      next: list => { this.notifications.set(list); this.isLoading.set(false); },
      error: ()   => this.isLoading.set(false),
    });
  }

  private _navigate(n: AppNotification): void {
    if (n.type.startsWith('APPOINTMENT_')) {
      this.router.navigate(['/appointments']);
    } else if (n.type === 'TREATMENT_PLAN_CREATED') {
      this.router.navigate(['/attention']);
    } else {
      this.router.navigate(['/billing']);
    }
  }
}
