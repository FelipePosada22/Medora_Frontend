import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CurrencyService } from '../../../../core/currency/currency.service';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DashboardViewModel } from '../../view-models/dashboard.viewmodel';
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS } from '../../../appointments/models/appointment.model';
import type { BadgeVariant } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardViewModel],
  imports: [RouterLink, DatePipe, CurrencyPipe, CardComponent, BadgeComponent, AvatarComponent, ButtonComponent],
  styles: [`
    /* Period tabs */
    .period-tabs {
      display: flex;
      gap: var(--space-1);
      background: var(--color-neutral-100);
      border-radius: var(--radius-lg);
      padding: var(--space-1);
      width: fit-content;
    }
    .period-tab {
      padding: var(--space-1) var(--space-4);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      border: none; border-radius: var(--radius-md);
      cursor: pointer; background: transparent;
      transition: all var(--transition-fast);
      &:hover { color: var(--color-text-primary); background: var(--color-neutral-0); }
    }
    .period-tab--active {
      background: var(--color-neutral-0);
      color: var(--color-primary-600);
      box-shadow: 0 1px 3px rgba(0,0,0,.1);
    }

    /* KPI grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
    }
    .kpi-card { padding: var(--space-5); }
    .kpi-card__icon {
      width: 40px; height: 40px;
      border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center;
      font-size: var(--font-size-lg);
      margin-bottom: var(--space-3);
    }
    .kpi-card__icon--blue   { background: var(--color-primary-50); }
    .kpi-card__icon--green  { background: var(--color-success-50, #f0fdf4); }
    .kpi-card__icon--amber  { background: var(--color-warning-50, #fffbeb); }
    .kpi-card__icon--red    { background: var(--color-error-50, #fef2f2); }
    .kpi-card__label { font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: var(--space-1); }
    .kpi-card__value { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); line-height: 1; }
    .kpi-card__sub { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: var(--space-1); }

    /* Period stats strip */
    .stats-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--space-4);
    }
    .stat-cell { padding: var(--space-4) var(--space-5); }
    .stat-cell__label { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-1); }
    .stat-cell__value { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
    .stat-cell__value--green { color: var(--color-success-600); }
    .stat-cell__value--amber { color: var(--color-warning-700); }

    /* Dashboard grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: var(--space-4);
      align-items: start;
      > * { min-width: 0; }
    }
    @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }

    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--space-4);
    }
    .section-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }

    /* Bar chart */
    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 64px;
      padding: var(--space-3) var(--space-5) var(--space-2);
      border-top: 1px solid var(--color-border);
    }
    .bar-chart__bar {
      flex: 1;
      min-width: 4px;
      background: var(--color-primary-200);
      border-radius: 2px 2px 0 0;
      transition: background var(--transition-fast);
      cursor: default;
      &:hover { background: var(--color-primary-500); }
    }

    /* Appt list */
    .appt-row { display: flex; flex-direction: column; gap: var(--space-1); padding: var(--space-1) 0; }
    .appt-row__main { display: flex; align-items: center; gap: var(--space-3); }
    .appt-row__time { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-primary-700); min-width: 48px; }
    .appt-row__patient { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); flex: 1; }
    .appt-row__type { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
    .appt-row__pro  { font-size: var(--font-size-xs); color: var(--color-text-muted); }

    /* Sidebar panels */
    .sidebar-stack { display: flex; flex-direction: column; gap: var(--space-4); }

    .pro-item {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-2) 0;
      &:not(:last-child) { border-bottom: 1px solid var(--color-border); }
    }
    .pro-item__rank {
      width: 24px; height: 24px; border-radius: 50%;
      background: var(--color-primary-100); color: var(--color-primary-700);
      font-size: var(--font-size-xs); font-weight: var(--font-weight-bold);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .pro-item__info { flex: 1; }
    .pro-item__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-primary); }
    .pro-item__spec { font-size: var(--font-size-xs); color: var(--color-text-muted); }
    .pro-item__count { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-success-600); }

    .inv-item {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-2) 0;
      &:not(:last-child) { border-bottom: 1px solid var(--color-border); }
    }
    .inv-item__name { flex: 1; font-size: var(--font-size-sm); color: var(--color-text-primary); }
    .inv-item__amount { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-warning-700); }
  `],
})
export class DashboardPageComponent {
  protected readonly vm           = inject(DashboardViewModel);
  protected readonly AppointmentStatus = AppointmentStatus;
  protected readonly currencyCode = inject(CurrencyService).currencyCode;

  protected statusBadge(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      SCHEDULED: 'scheduled', CONFIRMED: 'confirmed',
      COMPLETED: 'completed', CANCELLED: 'cancelled', NO_SHOW: 'no-show',
    };
    return map[status] ?? 'default';
  }

  protected statusLabel(status: string): string {
    return APPOINTMENT_STATUS_LABELS[status as AppointmentStatus] ?? status;
  }
}
