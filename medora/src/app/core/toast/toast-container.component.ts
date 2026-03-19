import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class]="'toast toast--' + toast.type"
          role="alert">
          <span class="toast__icon">{{ icon(toast.type) }}</span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)" aria-label="Cerrar">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--space-5);
      right: var(--space-5);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      width: 360px;
      max-width: calc(100vw - 2 * var(--space-5));
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.14);
      border-left: 4px solid;
      pointer-events: auto;
      animation: toast-in 0.22s ease-out;
    }

    @keyframes toast-in {
      from { transform: translateX(calc(100% + var(--space-5))); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }

    .toast--success { border-color: var(--color-success-500); }
    .toast--error   { border-color: var(--color-error-500); }
    .toast--warning { border-color: var(--color-warning-500); }
    .toast--info    { border-color: var(--color-primary-500); }

    .toast__icon {
      font-size: 16px;
      line-height: 1.5;
      flex-shrink: 0;
    }
    .toast--success .toast__icon { color: var(--color-success-600); }
    .toast--error   .toast__icon { color: var(--color-error-600); }
    .toast--warning .toast__icon { color: var(--color-warning-600); }
    .toast--info    .toast__icon { color: var(--color-primary-600); }

    .toast__message {
      flex: 1;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      line-height: 1.5;
    }

    .toast__close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
      font-size: 14px;
      flex-shrink: 0;
      line-height: 1;
      padding: 2px;
      &:hover { color: var(--color-text-primary); }
    }
  `],
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  protected icon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error:   '✕',
      warning: '⚠',
      info:    'ℹ',
    };
    return icons[type];
  }
}
