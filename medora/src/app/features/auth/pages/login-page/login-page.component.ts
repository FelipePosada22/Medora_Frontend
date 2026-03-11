import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LoginViewModel } from '../../view-models/login.viewmodel';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

/**
 * Login page — container component.
 *
 * Provides and injects LoginViewModel (scoped to this page).
 * Delegates all state and logic to the ViewModel.
 * The template only binds signals and passes the form reference down.
 */
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoginViewModel],
  imports: [LoginFormComponent],
})
export class LoginPageComponent {
  protected readonly vm = inject(LoginViewModel);
}
