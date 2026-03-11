import { Component, input, ChangeDetectionStrategy } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

/**
 * Reusable button component.
 * Supports multiple variants, sizes, loading and disabled states.
 *
 * @example
 * <app-button variant="primary" (click)="save()">Guardar</app-button>
 */
@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-button-host' },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="'btn btn--' + variant() + ' btn--' + size()"
      [class.btn--loading]="loading()"
    >
      @if (loading()) {
        <span class="btn__spinner" aria-hidden="true"></span>
      }
      <ng-content />
    </button>
  `,
  styles: [`
    :host { display: contents; }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-medium);
      transition: background var(--transition-fast), opacity var(--transition-fast);
      cursor: pointer;
      white-space: nowrap;
      border: 1px solid transparent;

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn--sm   { padding: var(--space-1) var(--space-3); font-size: var(--font-size-sm); }
    .btn--md   { padding: var(--space-2) var(--space-4); font-size: var(--font-size-sm); }
    .btn--lg   { padding: var(--space-3) var(--space-6); font-size: var(--font-size-base); }

    .btn--primary {
      background: var(--color-primary-600);
      color: var(--color-neutral-0);
      &:hover:not(:disabled) { background: var(--color-primary-700); }
    }
    .btn--secondary {
      background: var(--color-neutral-0);
      color: var(--color-text-primary);
      border-color: var(--color-border);
      &:hover:not(:disabled) { background: var(--color-neutral-50); }
    }
    .btn--ghost {
      background: transparent;
      color: var(--color-text-secondary);
      &:hover:not(:disabled) { background: var(--color-neutral-100); }
    }
    .btn--danger {
      background: var(--color-error-500);
      color: var(--color-neutral-0);
      &:hover:not(:disabled) { background: var(--color-error-700); }
    }

    .btn__spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class ButtonComponent {
  readonly variant  = input<ButtonVariant>('primary');
  readonly size     = input<ButtonSize>('md');
  readonly type     = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading  = input(false);
}
