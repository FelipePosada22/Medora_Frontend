import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Surface card component.
 * Provides a consistent container for page sections and list items.
 *
 * @example
 * <app-card [padding]="'lg'">
 *   <ng-content />
 * </app-card>
 */
@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: [`
    :host {
      display: block;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xs);
    }
    :host([padding="sm"]) { padding: var(--space-3); }
    :host([padding="md"]) { padding: var(--space-4); }
    :host([padding="lg"]) { padding: var(--space-6); }
    :host([padding="none"]) { padding: 0; }
  `],
  host: { '[attr.padding]': 'padding()' },
})
export class CardComponent {
  /** Controls inner padding. Defaults to 'md'. */
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
}
