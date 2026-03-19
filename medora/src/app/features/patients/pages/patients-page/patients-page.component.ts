import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PatientsViewModel } from '../../view-models/patients.viewmodel';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

@Component({
  selector: 'app-patients-page',
  templateUrl: './patients-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PatientsViewModel],
  imports: [DatePipe, ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, InputComponent],
  styles: [`
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
    .link-btn {
      display: inline-flex; align-items: center;
      padding: var(--space-1) var(--space-3);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: transparent;
      text-decoration: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover { background: var(--color-neutral-100); color: var(--color-text-primary); }
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
export class PatientsPageComponent {
  protected readonly vm = inject(PatientsViewModel);
}
