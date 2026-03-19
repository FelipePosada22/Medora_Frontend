import {
  Component, input, signal, computed,
  ChangeDetectionStrategy, forwardRef, ElementRef, inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SearchSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-search-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchSelectComponent),
      multi: true,
    },
  ],
  host: {
    class: 'ss-host',
    '(focusout)': 'onFocusOut($event)',
  },
  template: `
    <div class="ss" [class.ss--open]="isOpen()" [class.ss--error]="hasError()">
      @if (label()) {
        <label class="ss__label">
          {{ label() }}
          @if (required()) { <span class="ss__required">*</span> }
        </label>
      }

      <div class="ss__trigger" (click)="open()">
        <input
          #searchInput
          class="ss__input"
          type="text"
          autocomplete="off"
          [placeholder]="isOpen() ? 'Buscar...' : (selectedLabel() || placeholder())"
          [value]="isOpen() ? query() : ''"
          [class.ss__input--has-value]="!isOpen() && selectedLabel()"
          (input)="onQueryInput($event)"
          (focus)="open()"
          (keydown)="onKeydown($event)"
        />
        <span class="ss__chevron" [class.ss__chevron--up]="isOpen()">▾</span>
      </div>

      @if (isOpen()) {
        <div class="ss__dropdown" role="listbox">
          @if (filtered().length === 0) {
            <div class="ss__empty">Sin resultados</div>
          }
          @for (opt of filtered(); track opt.value) {
            <div
              class="ss__option"
              [class.ss__option--selected]="opt.value === value()"
              role="option"
              (mousedown)="select(opt)">
              {{ opt.label }}
            </div>
          }
          @if (hiddenCount() > 0) {
            <div class="ss__more">+{{ hiddenCount() }} más — escribe para filtrar</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host.ss-host { display: block; }

    .ss { position: relative; display: flex; flex-direction: column; gap: var(--space-1); }

    .ss__label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }
    .ss__required { color: var(--color-error-500); margin-left: 2px; }

    .ss__trigger {
      position: relative;
      display: flex;
      align-items: center;
    }

    .ss__input {
      width: 100%;
      padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      background: var(--color-surface);
      color: var(--color-text-tertiary);
      outline: none;
      cursor: pointer;
      transition: border-color var(--transition-fast);
      box-sizing: border-box;
      &::placeholder { color: var(--color-text-tertiary); }
    }
    .ss__input--has-value { color: var(--color-text-primary); }
    .ss--open .ss__input { cursor: text; border-color: var(--color-primary-400); }
    .ss--error .ss__input { border-color: var(--color-error-500); }

    .ss__chevron {
      position: absolute;
      right: var(--space-3);
      font-size: 12px;
      color: var(--color-text-muted);
      pointer-events: none;
      transition: transform var(--transition-fast);
      line-height: 1;
    }
    .ss__chevron--up { transform: scaleY(-1); }

    .ss__dropdown {
      position: absolute;
      top: calc(100% + 2px);
      left: 0; right: 0;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: 0 4px 16px rgba(0,0,0,.1);
      z-index: 200;
      max-height: 240px;
      overflow-y: auto;
    }

    .ss__option {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      cursor: pointer;
      transition: background var(--transition-fast);
      &:hover { background: var(--color-neutral-50); }
    }
    .ss__option--selected {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      font-weight: var(--font-weight-medium);
    }

    .ss__empty {
      padding: var(--space-3);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      text-align: center;
    }

    .ss__more {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      text-align: center;
      border-top: 1px solid var(--color-border);
      background: var(--color-neutral-50);
    }
  `],
})
export class SearchSelectComponent implements ControlValueAccessor {
  readonly items       = input<SearchSelectOption[]>([]);
  readonly label       = input('');
  readonly placeholder = input('Seleccionar...');
  readonly required    = input(false);
  readonly hasError    = input(false);

  protected readonly value    = signal('');
  protected readonly isOpen   = signal(false);
  protected readonly query    = signal('');
  protected readonly isDisabled = signal(false);

  protected readonly selectedLabel = computed(() => {
    const v = this.value();
    return this.items().find(o => o.value === v)?.label ?? '';
  });

  readonly maxVisible = input(50);

  protected readonly filtered = computed(() => {
    const q     = this.query().toLowerCase().trim();
    const items = this.items();
    const result = q ? items.filter(o => o.label.toLowerCase().includes(q)) : items;
    return result.slice(0, this.maxVisible());
  });

  protected readonly hiddenCount = computed(() => {
    const q     = this.query().toLowerCase().trim();
    const items = this.items();
    const total = q ? items.filter(o => o.label.toLowerCase().includes(q)).length : items.length;
    return Math.max(0, total - this.maxVisible());
  });

  private readonly el = inject(ElementRef);

  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void       = () => {};

  writeValue(v: string): void                        { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void    { this.onChange = fn; }
  registerOnTouched(fn: () => void): void            { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void          { this.isDisabled.set(disabled); }

  protected open(): void {
    if (this.isDisabled()) return;
    this.query.set('');
    this.isOpen.set(true);
  }

  protected select(opt: SearchSelectOption): void {
    this.value.set(opt.value);
    this.onChange(opt.value);
    this.onTouched();
    this.isOpen.set(false);
    this.query.set('');
  }

  protected onQueryInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }

  protected onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.isOpen.set(false);
      this.query.set('');
    }
    if (e.key === 'Enter') {
      const opts = this.filtered();
      if (opts.length === 1) this.select(opts[0]);
    }
  }

  protected onFocusOut(e: FocusEvent): void {
    const related = e.relatedTarget as Node | null;
    if (!this.el.nativeElement.contains(related)) {
      this.isOpen.set(false);
      this.query.set('');
    }
  }
}
