import { Component, input, ChangeDetectionStrategy } from '@angular/core';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'scheduled'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no-show';

/**
 * Status badge component.
 * Maps appointment statuses and generic semantic states to styled chips.
 *
 * @example
 * <app-badge variant="confirmed">Confirmada</app-badge>
 */
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [class]="'badge--' + variant()">
      <ng-content />
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px var(--space-2);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
    }

    .badge--default   { background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .badge--success   { background: var(--color-success-50);  color: var(--color-success-700); }
    .badge--warning   { background: var(--color-warning-50);  color: var(--color-warning-700); }
    .badge--error     { background: var(--color-error-50);    color: var(--color-error-700);   }
    .badge--info      { background: var(--color-info-50);     color: var(--color-info-700);    }

    // Appointment statuses
    .badge--scheduled  { background: #eff6ff; color: var(--color-status-scheduled); }
    .badge--confirmed  { background: #ecfdf5; color: var(--color-status-confirmed); }
    .badge--cancelled  { background: #fef2f2; color: var(--color-status-cancelled); }
    .badge--completed  { background: #eef2ff; color: var(--color-status-completed); }
    .badge--no-show    { background: #fffbeb; color: var(--color-status-no-show);   }
  `],
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
}
