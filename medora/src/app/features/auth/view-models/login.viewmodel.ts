import { Injectable, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * ViewModel for the Login page.
 *
 * Responsibilities:
 * - Owns the reactive form definition.
 * - Exposes loading and error state as signals.
 * - Delegates business logic to AuthService.
 * - Does NOT navigate or manipulate DOM directly.
 *
 * Scoped to LoginPageComponent via `providers: [LoginViewModel]`.
 */
@Injectable()
export class LoginViewModel {
  private readonly authService = inject(AuthService);
  private readonly fb          = inject(FormBuilder);

  /** Reactive form for the login screen. */
  readonly form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** True while the login HTTP request is in flight. */
  readonly isLoading = signal(false);

  /** Error message to display below the form on failure. */
  readonly errorMessage = signal<string | null>(null);

  /**
   * Submits the login form.
   * Guards against invalid form state before calling the service.
   */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService
      .login({ email: email!, password: password! })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        error: err => {
          this.errorMessage.set(
            err?.error?.message ?? 'Credenciales incorrectas. Intenta nuevamente.',
          );
        },
      });
  }
}
