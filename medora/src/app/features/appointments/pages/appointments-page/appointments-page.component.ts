import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { AppointmentsViewModel, StatusFilter } from '../../view-models/appointments.viewmodel';
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS } from '../../models/appointment.model';
import type { BadgeVariant } from '../../../../shared/components/badge/badge.component';

/**
 * Appointments list page.
 * Full CRUD list with status filter tabs and search.
 */
@Component({
  selector: 'app-appointments-page',
  templateUrl: './appointments-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AppointmentsViewModel],
  imports: [RouterLink, CardComponent, BadgeComponent, ButtonComponent, AvatarComponent, DatePipe],
  styles: [`
    .status-tabs {
      display: flex;
      gap: var(--space-1);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-4);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .status-tab {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      cursor: pointer;
      background: none;
      white-space: nowrap;
      flex-shrink: 0;
      border-top: none; border-left: none; border-right: none;
      transition: all var(--transition-fast);
    }
    .status-tab--active {
      color: var(--color-primary-600);
      border-bottom-color: var(--color-primary-600);
    }
  `],
})
export class AppointmentsPageComponent {
  protected readonly vm               = inject(AppointmentsViewModel);
  protected readonly AppointmentStatus = AppointmentStatus;

  protected readonly tabs: { label: string; value: StatusFilter }[] = [
    { label: 'Todas',       value: 'all'                      },
    { label: 'Programadas', value: AppointmentStatus.SCHEDULED },
    { label: 'Confirmadas', value: AppointmentStatus.CONFIRMED },
    { label: 'Completadas', value: AppointmentStatus.COMPLETED },
    { label: 'Canceladas',  value: AppointmentStatus.CANCELLED },
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
}
