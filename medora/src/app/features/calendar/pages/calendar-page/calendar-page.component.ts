import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { CalendarViewModel } from '../../view-models/calendar.viewmodel';
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS } from '../../../appointments/models/appointment.model';
import type { BadgeVariant } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CalendarViewModel],
  imports: [RouterLink, DatePipe, CardComponent, ButtonComponent, BadgeComponent],
  styles: [`
    .calendar-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .view-toggle {
      display: flex;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .view-btn {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      background: var(--color-surface);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .view-btn--active { background: var(--color-primary-600); color: white; }

    .week-nav {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .nav-btn {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      cursor: pointer;
      &:hover { background: var(--color-neutral-100); }
    }
    .period-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      min-width: 220px;
      text-align: center;
    }

    /* Day / Week grid */
    .calendar-grid-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: 56px repeat(7, 1fr);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      font-size: var(--font-size-xs);
      @media (max-width: 768px) { min-width: 600px; }
    }
    .calendar-grid--day { grid-template-columns: 56px 1fr; }

    .cal-corner { background: var(--color-neutral-50); border-bottom: 1px solid var(--color-border); border-right: 1px solid var(--color-border); }
    .cal-day-header {
      padding: var(--space-3) var(--space-2);
      text-align: center;
      background: var(--color-neutral-50);
      border-bottom: 1px solid var(--color-border);
      border-right: 1px solid var(--color-border);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }
    .cal-day-header--today {
      background: var(--color-primary-50);
      color: var(--color-primary-600);
      font-weight: var(--font-weight-bold);
    }
    .cal-time {
      padding: var(--space-1) var(--space-2);
      text-align: right;
      color: var(--color-text-tertiary);
      border-right: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-neutral-50);
      height: 52px;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding-top: var(--space-1);
    }
    .cal-cell {
      border-right: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
      height: 52px;
      position: relative;
      padding: 2px;
    }
    .appt-chip {
      display: block;
      border-radius: var(--radius-sm);
      padding: 2px 4px;
      font-size: 10px;
      font-weight: var(--font-weight-medium);
      color: white;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      cursor: pointer;
    }
    .appt-chip--full { height: 100%; }
    .appt-chip--scheduled { background: var(--color-status-scheduled); }
    .appt-chip--confirmed  { background: var(--color-status-confirmed); }
    .appt-chip--completed  { background: var(--color-status-completed); }
    .appt-chip--cancelled  { background: var(--color-status-cancelled); opacity: 0.6; }
    .appt-chip--no_show    { background: var(--color-status-no-show); }

    /* Month grid */
    .month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      font-size: var(--font-size-xs);
    }
    .month-day-header {
      padding: var(--space-2);
      text-align: center;
      background: var(--color-neutral-50);
      border-bottom: 1px solid var(--color-border);
      border-right: 1px solid var(--color-border);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
    }
    .month-cell {
      min-height: 88px;
      border-right: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
      padding: var(--space-1);
      overflow: hidden;
    }
    .month-cell--other-month { background: var(--color-neutral-50); }
    .month-cell--today { background: var(--color-primary-50); }
    .month-cell__date {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      margin-bottom: 2px;
    }
    .month-cell__date--today {
      color: var(--color-primary-600);
      font-weight: var(--font-weight-bold);
    }
    .month-overflow {
      font-size: 9px;
      color: var(--color-text-muted);
      padding: 1px 2px;
      margin-top: 1px;
    }

    .legend {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex; align-items: center; gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .legend-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Detail panel */
    .detail-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.35);
      z-index: 100;
    }
    .detail-panel {
      position: fixed;
      top: 0; right: 0;
      width: 380px; max-width: 95vw;
      height: 100vh;
      background: var(--color-surface);
      box-shadow: -4px 0 24px rgba(0,0,0,.12);
      z-index: 101;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .detail-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-5);
      border-bottom: 1px solid var(--color-border);
    }
    .detail-header__title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    .detail-close {
      background: none; border: none; cursor: pointer;
      font-size: var(--font-size-xl);
      color: var(--color-text-muted);
      line-height: 1;
      &:hover { color: var(--color-text-primary); }
    }
    .detail-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .detail-row {
      display: flex; flex-direction: column; gap: var(--space-1);
    }
    .detail-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .detail-value {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }
    .detail-divider {
      border: none; border-top: 1px solid var(--color-border);
    }
    .detail-actions {
      padding: var(--space-4) var(--space-5);
      border-top: 1px solid var(--color-border);
      display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center;
    }
    .patient-link {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-primary-600);
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    /* Reminders */
    .reminder-section {
      padding: var(--space-1) 0 var(--space-2);
    }
    .reminder-section__header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--space-3);
    }
    .reminder-section__title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    .reminder-empty {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      text-align: center;
      padding: var(--space-3) 0;
      margin: 0;
    }
    .reminder-list { display: flex; flex-direction: column; gap: var(--space-2); }
    .reminder-item {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3);
    }
    .reminder-item__top {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--space-1);
    }
    .reminder-item__type {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-success-700);
      background: var(--color-success-50);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .reminder-item__date {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
    .reminder-item__msg {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    /* Filter bar */
    .filter-bar {
      display: flex;
      align-items: flex-end;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .filter-field {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
    .filter-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }
    .filter-select {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      background: var(--color-surface);
      outline: none;
      min-width: 180px;
      &:focus { border-color: var(--color-primary-400); }
    }
    .filter-clear {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      align-self: flex-end;
      &:hover { color: var(--color-text-primary); border-color: var(--color-text-secondary); }
    }
  `],
})
export class CalendarPageComponent {
  protected readonly vm                = inject(CalendarViewModel);
  protected readonly AppointmentStatus = AppointmentStatus;

  protected readonly MONTH_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  protected onProfessionalFilter(id: string): void {
    this.vm.filterProfessionalId.set(id);
  }

  protected clearFilters(): void {
    this.vm.filterProfessionalId.set('');
    this.vm.filterAppointmentTypeId.set('');
  }

  protected statusBadge(status: AppointmentStatus): BadgeVariant {
    const map: Record<AppointmentStatus, BadgeVariant> = {
      [AppointmentStatus.SCHEDULED]: 'scheduled',
      [AppointmentStatus.CONFIRMED]: 'confirmed',
      [AppointmentStatus.COMPLETED]: 'completed',
      [AppointmentStatus.CANCELLED]: 'cancelled',
      [AppointmentStatus.NO_SHOW]:   'no-show',
    };
    return map[status] ?? 'default';
  }

  protected statusLabel(status: AppointmentStatus): string {
    return APPOINTMENT_STATUS_LABELS[status] ?? status;
  }
}
