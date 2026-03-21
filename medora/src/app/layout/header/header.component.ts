import { Component, inject, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AuthStateService } from '../../core/auth/services/auth-state.service';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly authState   = inject(AuthStateService);

  readonly pageTitle   = input('');
  readonly menuToggle  = output<void>();

  protected readonly user     = this.authState.user;
  protected readonly showMenu = signal(false);

  protected toggleMenu(): void  { this.showMenu.update(v => !v); }
  protected closeMenu(): void   { this.showMenu.set(false); }

  protected logout(): void {
    this.showMenu.set(false);
    this.authService.logout();
  }
}
