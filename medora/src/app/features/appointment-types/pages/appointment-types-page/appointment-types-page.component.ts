import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { AppointmentTypesViewModel } from '../../view-models/appointment-types.viewmodel';

/**
 * Appointment types management page.
 * Lists all service types with duration and price.
 */
@Component({
  selector: 'app-appointment-types-page',
  templateUrl: './appointment-types-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AppointmentTypesViewModel],
  imports: [CardComponent, ButtonComponent, InputComponent, ReactiveFormsModule],
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
    }
    .stat-card { text-align: center; padding: var(--space-5); }
    .stat-card__value {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-primary-600);
    }
    .stat-card__label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-top: var(--space-1);
    }
    .form-panel {
      background: var(--color-neutral-50);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
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
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }
  `],
})
export class AppointmentTypesPageComponent {
  protected readonly vm = inject(AppointmentTypesViewModel);
}
