import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AuthStateService } from '../../core/auth/services/auth-state.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

/**
 * Main sidebar navigation component.
 * Displays the clinic brand, navigation links, and the current user info.
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, AvatarComponent],
})
export class SidebarComponent {
  private readonly authState = inject(AuthStateService);

  protected readonly user       = this.authState.user;
  protected readonly isCollapsed = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard',       route: '/dashboard',          icon: '⊞'  },
    { label: 'Agenda',          route: '/calendar',           icon: '📅' },
    { label: 'Pacientes',       route: '/patients',           icon: '👤' },
    { label: 'Citas',           route: '/appointments',       icon: '📋' },
    { label: 'Profesionales',   route: '/professionals',      icon: '🩺' },
    { label: 'Tipos de cita',   route: '/appointment-types',  icon: '🏷'  },
    { label: 'Horarios',        route: '/schedules',          icon: '🕐' },
    { label: 'Facturación',     route: '/billing',            icon: '💰' },
    { label: 'Atención',        route: '/attention',          icon: '🔬' },
    { label: 'Configuración',   route: '/settings',           icon: '⚙️' },
  ];

  protected toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }
}
