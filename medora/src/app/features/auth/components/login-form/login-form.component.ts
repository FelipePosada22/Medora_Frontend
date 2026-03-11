import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

/**
 * Presentational login form component.
 *
 * Receives the form group and loading state from the parent (page/viewmodel).
 * Emits a `submitted` event when the user clicks the submit button.
 * Contains zero business logic.
 */
@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
})
export class LoginFormComponent {
  /** The FormGroup instance owned by LoginViewModel. */
  readonly form      = input.required<FormGroup>();
  readonly isLoading = input(false);
  readonly submitted = output<void>();

  protected getError(field: string): string {
    const ctrl = this.form().get(field);
    if (!ctrl?.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required'))  return 'Este campo es obligatorio.';
    if (ctrl.hasError('email'))     return 'Ingresa un email válido.';
    if (ctrl.hasError('minlength')) return 'Mínimo 6 caracteres.';
    return 'Campo inválido.';
  }
}
