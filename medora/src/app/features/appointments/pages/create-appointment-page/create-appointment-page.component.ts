import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { CreateAppointmentViewModel } from '../../view-models/create-appointment.viewmodel';

/**
 * Create appointment page.
 * Form: patient, service type, professional, date, start/end time, notes.
 */
@Component({
  selector: 'app-create-appointment-page',
  templateUrl: './create-appointment-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CreateAppointmentViewModel],
  imports: [RouterLink, ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent],
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

    .form-field { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }
    .form-select, .form-textarea {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      background: var(--color-surface);
      outline: none;
      &:focus {
        border-color: var(--color-border-focus);
        box-shadow: 0 0 0 3px var(--color-primary-100);
      }
    }
    .form-textarea { resize: vertical; min-height: 80px; font-family: inherit; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }
  `],
})
export class CreateAppointmentPageComponent {
  protected readonly vm = inject(CreateAppointmentViewModel);
}
