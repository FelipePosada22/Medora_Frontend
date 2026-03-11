import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
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
  imports: [CardComponent, ButtonComponent],
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
  `],
})
export class AppointmentTypesPageComponent {
  protected readonly vm = inject(AppointmentTypesViewModel);
}
