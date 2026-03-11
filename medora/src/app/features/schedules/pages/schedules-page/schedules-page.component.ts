import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

interface DaySchedule {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
}

interface ProfessionalSchedule {
  id: string;
  name: string;
  specialty: string;
  days: DaySchedule[];
}

/**
 * Work schedules configuration page.
 * Displays and edits working hours per professional.
 */
@Component({
  selector: 'app-schedules-page',
  templateUrl: './schedules-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, ButtonComponent, AvatarComponent],
  styles: [`
    .schedule-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .schedule-card__header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .schedule-card__info { flex: 1; }
    .schedule-card__name {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-base);
    }
    .schedule-card__specialty {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--space-2);
    }
    @media (max-width: 768px) { .days-grid { grid-template-columns: repeat(4, 1fr); } }

    .day-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: var(--space-2) var(--space-1);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      font-size: 10px;
      text-align: center;
    }
    .day-chip--active {
      background: var(--color-primary-50);
      border-color: var(--color-primary-200);
      color: var(--color-primary-700);
    }
    .day-chip--inactive {
      background: var(--color-neutral-50);
      color: var(--color-text-tertiary);
    }
    .day-chip__name { font-weight: var(--font-weight-semibold); font-size: var(--font-size-xs); }
    .day-chip__hours { font-size: 9px; }
  `],
})
export class SchedulesPageComponent {
  protected readonly selectedPro = signal<string | null>(null);

  protected readonly schedules: ProfessionalSchedule[] = [
    {
      id: 'P-001', name: 'Dr. Julian Smith', specialty: 'Odontología General',
      days: [
        { day: 'Lun', enabled: true,  start: '08:00', end: '17:00' },
        { day: 'Mar', enabled: true,  start: '08:00', end: '17:00' },
        { day: 'Mié', enabled: true,  start: '08:00', end: '17:00' },
        { day: 'Jue', enabled: true,  start: '08:00', end: '17:00' },
        { day: 'Vie', enabled: true,  start: '08:00', end: '14:00' },
        { day: 'Sáb', enabled: false, start: '09:00', end: '13:00' },
        { day: 'Dom', enabled: false, start: '09:00', end: '13:00' },
      ],
    },
    {
      id: 'P-002', name: 'Dra. Elena Lopez', specialty: 'Ortodoncia',
      days: [
        { day: 'Lun', enabled: true,  start: '09:00', end: '18:00' },
        { day: 'Mar', enabled: false, start: '09:00', end: '18:00' },
        { day: 'Mié', enabled: true,  start: '09:00', end: '18:00' },
        { day: 'Jue', enabled: false, start: '09:00', end: '18:00' },
        { day: 'Vie', enabled: true,  start: '09:00', end: '15:00' },
        { day: 'Sáb', enabled: true,  start: '09:00', end: '13:00' },
        { day: 'Dom', enabled: false, start: '09:00', end: '13:00' },
      ],
    },
    {
      id: 'P-004', name: 'Dra. Sara Núñez', specialty: 'Endodoncia',
      days: [
        { day: 'Lun', enabled: true,  start: '10:00', end: '19:00' },
        { day: 'Mar', enabled: true,  start: '10:00', end: '19:00' },
        { day: 'Mié', enabled: false, start: '10:00', end: '19:00' },
        { day: 'Jue', enabled: true,  start: '10:00', end: '19:00' },
        { day: 'Vie', enabled: true,  start: '10:00', end: '16:00' },
        { day: 'Sáb', enabled: false, start: '10:00', end: '13:00' },
        { day: 'Dom', enabled: false, start: '10:00', end: '13:00' },
      ],
    },
  ];
}
