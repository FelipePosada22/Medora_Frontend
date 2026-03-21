import { Component, inject, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AuthStateService } from '../../core/auth/services/auth-state.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { NotificationsService } from '../../core/notifications/notifications.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, DatePipe],
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly authState   = inject(AuthStateService);
  protected readonly notif     = inject(NotificationsService);

  readonly pageTitle  = input('');
  readonly menuToggle = output<void>();

  protected readonly user     = this.authState.user;
  protected readonly showMenu = signal(false);

  protected toggleMenu(): void {
    this.notif.close();
    this.showMenu.update(v => !v);
  }

  protected closeMenu(): void { this.showMenu.set(false); }

  protected toggleNotif(): void {
    if (this.showMenu()) this.showMenu.set(false);
    this.notif.toggle();
  }

  protected logout(): void {
    this.showMenu.set(false);
    this.authService.logout();
  }
}
