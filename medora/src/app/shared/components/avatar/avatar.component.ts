import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Avatar component displaying user initials or a photo.
 *
 * @example
 * <app-avatar name="Juan Pérez" size="md" />
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="name()" class="avatar" [class]="'avatar--' + size()" />
    } @else {
      <span class="avatar avatar--initials" [class]="'avatar--' + size()">
        {{ initials() }}
      </span>
    }
  `,
  styles: [`
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      font-weight: var(--font-weight-semibold);
      background: var(--color-primary-100);
      color: var(--color-primary-700);
      object-fit: cover;
      flex-shrink: 0;
    }
    .avatar--xs { width: 24px;  height: 24px;  font-size: 10px; }
    .avatar--sm { width: 32px;  height: 32px;  font-size: 12px; }
    .avatar--md { width: 40px;  height: 40px;  font-size: 14px; }
    .avatar--lg { width: 56px;  height: 56px;  font-size: 18px; }
  `],
})
export class AvatarComponent {
  readonly name = input('');
  readonly src  = input('');
  readonly size = input<AvatarSize>('md');

  protected readonly initials = computed(() =>
    this.name()
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join(''),
  );
}
