import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AuthStateService } from '../../core/auth/services/auth-state.service';

/**
 * Top header bar for the dashboard layout.
 * Displays the current page title and user menu.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
})
export class HeaderComponent {
  private readonly authState = inject(AuthStateService);
  private readonly router    = inject(Router);

  readonly pageTitle = input('');

  protected readonly user = this.authState.user;

  protected logout(): void {
    this.authState.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
