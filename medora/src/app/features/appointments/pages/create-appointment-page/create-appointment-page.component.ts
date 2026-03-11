import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

interface TimeSlot {
  time: string;
  available: boolean;
}

/**
 * Create appointment page.
 * Form: patient search, service type, professional, date, time slot, notes.
 */
@Component({
  selector: 'app-create-appointment-page',
  templateUrl: './create-appointment-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

    .time-slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: var(--space-2);
    }
    .time-slot-btn {
      padding: var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-align: center;
      cursor: pointer;
      background: var(--color-surface);
      color: var(--color-text-primary);
      transition: all var(--transition-fast);
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
    .time-slot-btn--selected {
      background: var(--color-primary-600);
      color: white;
      border-color: var(--color-primary-600);
    }
    .time-slot-btn:not(:disabled):not(.time-slot-btn--selected):hover {
      border-color: var(--color-primary-600);
      color: var(--color-primary-600);
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
export class CreateAppointmentPageComponent {
  private readonly fb = new FormBuilder();

  protected readonly selectedSlot = signal<string | null>(null);
  protected readonly isSubmitting  = signal(false);

  protected readonly form = this.fb.group({
    patientSearch: ['', Validators.required],
    serviceType:   ['', Validators.required],
    professional:  ['', Validators.required],
    date:          ['', Validators.required],
    notes:         [''],
  });

  protected readonly professionals = [
    'Dr. Julian Smith — Odontología General',
    'Dra. Elena Lopez — Ortodoncia',
    'Dr. Marc Rivera — Radiología',
    'Dra. Sara Núñez — Endodoncia',
    'Dr. Pablo Herrera — Odontología General',
  ];

  protected readonly serviceTypes = [
    'Consulta General',
    'Limpieza Dental',
    'Ortodoncia',
    'Extracción',
    'Radiografía',
    'Blanqueamiento',
    'Endodoncia',
    'Sellador de Fisuras',
  ];

  protected readonly timeSlots: TimeSlot[] = [
    { time: '08:00', available: true  },
    { time: '08:30', available: true  },
    { time: '09:00', available: false },
    { time: '09:30', available: true  },
    { time: '10:00', available: false },
    { time: '10:30', available: true  },
    { time: '11:00', available: false },
    { time: '11:30', available: true  },
    { time: '12:00', available: true  },
    { time: '14:00', available: true  },
    { time: '14:30', available: false },
    { time: '15:00', available: true  },
    { time: '15:30', available: true  },
    { time: '16:00', available: true  },
  ];

  protected selectSlot(time: string): void {
    this.selectedSlot.set(time);
  }

  protected submit(): void {
    if (this.form.invalid || !this.selectedSlot()) return;
    this.isSubmitting.set(true);
    // TODO: call service
    setTimeout(() => this.isSubmitting.set(false), 1500);
  }
}
