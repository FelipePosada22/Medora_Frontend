import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
  imports: [CardComponent, ButtonComponent, AvatarComponent, ReactiveFormsModule],
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
    .day-chip__action {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 11px;
      line-height: 1;
      padding: 0;
      margin-top: 2px;
    }
    .day-chip__action--add { color: var(--color-primary-600); }
    .day-chip__action--remove { color: var(--color-error-600, #dc2626); }

    .form-panel {
      background: var(--color-neutral-50);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-top: var(--space-4);
    }
    .form-panel__title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--space-4);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
    .form-field { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }
    .form-select {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      background: var(--color-surface);
      outline: none;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }
  `],
})
export class SchedulesPageComponent {
  protected readonly vm = inject(SchedulesViewModel);

  readonly DAY_OPTIONS = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
  ];
}
