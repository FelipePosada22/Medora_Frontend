import {
  Component, input, ChangeDetectionStrategy,
  forwardRef, signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Reusable form input component with ControlValueAccessor.
 * Integrates seamlessly with Angular Reactive Forms.
 *
 * @example
 * <app-input label="Email" type="email" formControlName="email" />
 */
@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="field" [class.field--error]="errorMessage()">
      @if (label()) {
        <label [for]="inputId()" class="field__label">
          {{ label() }}
          @if (required()) { <span class="field__required">*</span> }
        </label>
      }

      <input
        [id]="inputId()"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="field__input"
      />

      @if (errorMessage()) {
        <span class="field__error">{{ errorMessage() }}</span>
      } @else if (hint()) {
        <span class="field__hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    .field { display: flex; flex-direction: column; gap: var(--space-1); }

    .field__label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }
    .field__required { color: var(--color-error-500); margin-left: 2px; }

    .field__input {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      background: var(--color-surface);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      outline: none;

      &::placeholder { color: var(--color-text-tertiary); }
      &:focus {
        border-color: var(--color-border-focus);
        box-shadow: 0 0 0 3px var(--color-primary-100);
      }
      &:disabled { background: var(--color-neutral-100); cursor: not-allowed; }
    }

    .field--error .field__input {
      border-color: var(--color-error-500);
      &:focus { box-shadow: 0 0 0 3px var(--color-error-50); }
    }

    .field__error { font-size: var(--font-size-xs); color: var(--color-error-500); }
    .field__hint  { font-size: var(--font-size-xs); color: var(--color-text-tertiary); }
  `],
})
export class InputComponent implements ControlValueAccessor {
  readonly label        = input('');
  readonly type         = input<string>('text');
  readonly placeholder  = input('');
  readonly hint         = input('');
  readonly errorMessage = input('');
  readonly required     = input(false);
  readonly inputId      = input(`input-${Math.random().toString(36).slice(2)}`);

  protected readonly value      = signal('');
  protected readonly isDisabled = signal(false);

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void       = () => {};

  writeValue(value: string): void      { this.value.set(value ?? ''); }
  registerOnChange(fn: (v: string) => void): void  { this.onChange = fn; }
  registerOnTouched(fn: () => void): void          { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void        { this.isDisabled.set(disabled); }

  protected onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }
}
