import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { SchedulesViewModel } from '../../view-models/schedules.viewmodel';

/**
 * Work schedules configuration page.
 * Displays working hours per professional loaded from the API.
 */
@Component({
  selector: 'app-schedules-page',
  templateUrl: './schedules-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SchedulesViewModel],
  imports: [CardComponent, ButtonComponent, AvatarComponent],
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
  protected readonly vm = inject(SchedulesViewModel);
}
