import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ProfessionalsViewModel } from '../../view-models/professionals.viewmodel';

/**
 * Professionals list page.
 * Displays medical staff with specialty filters.
 */
@Component({
  selector: 'app-professionals-page',
  templateUrl: './professionals-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProfessionalsViewModel],
  imports: [CardComponent, AvatarComponent, ButtonComponent],
  styles: [`
    .specialty-filters {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .filter-chip {
      padding: var(--space-1-5, 6px) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .filter-chip--active {
      background: var(--color-primary-600);
      color: white;
      border-color: var(--color-primary-600);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
    }
    .stat-card {
      text-align: center;
      padding: var(--space-5);
    }
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
export class ProfessionalsPageComponent {
  protected readonly vm = inject(ProfessionalsViewModel);
}
