import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DashboardViewModel, StaffStatus } from '../../view-models/dashboard.viewmodel';
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS } from '../../../appointments/models/appointment.model';
import type { BadgeVariant } from '../../../../shared/components/badge/badge.component';

interface KpiCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
}

/**
 * Dashboard overview page.
 * Displays KPI cards, upcoming appointments, and staff status.
 */
@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardViewModel],
  imports: [RouterLink, DatePipe, CardComponent, BadgeComponent, AvatarComponent, ButtonComponent],
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--space-4);
    }
    .kpi-card { display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-5); }
    .kpi-card__icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-lg);
      background: var(--color-primary-50);
      color: var(--color-primary-600);
      display: flex; align-items: center; justify-content: center;
      font-size: var(--font-size-xl);
      margin-bottom: var(--space-1);
    }
    .kpi-card__value {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      line-height: 1;
    }
    .kpi-card__label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
    }
    .kpi-card__trend {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      margin-top: var(--space-1);
    }
    .kpi-card__trend--up   { color: var(--color-success-600); }
    .kpi-card__trend--down { color: var(--color-error-600); }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: var(--space-4);
    }
    @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }

    .section-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-4);
    }

    .staff-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .staff-item {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      background: var(--color-neutral-50);
    }
    .staff-item__info { flex: 1; }
    .staff-item__name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }
    .staff-item__specialty {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .quick-actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
  `],
})
export class DashboardPageComponent {
  protected readonly vm               = inject(DashboardViewModel);
  protected readonly AppointmentStatus = AppointmentStatus;

  protected readonly kpis: KpiCard[] = [
    { label: 'Citas hoy',            value: '12', trend: '+5% vs ayer',    trendUp: true,  icon: '📅' },
    { label: 'Pacientes Atendidos',  value: '8',  trend: '-2% vs ayer',    trendUp: false, icon: '👤' },
    { label: 'Nuevos Pacientes',     value: '3',  trend: '+10% este mes',  trendUp: true,  icon: '✨' },
    { label: 'Ingresos del día',     value: '$1,240', trend: '+8% vs ayer', trendUp: true, icon: '💰' },
  ];

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

  protected staffVariant(status: StaffStatus): 'success' | 'warning' | 'default' {
    if (status === StaffStatus.ACTIVE)     return 'success';
    if (status === StaffStatus.IN_SESSION) return 'warning';
    return 'default';
  }
}
