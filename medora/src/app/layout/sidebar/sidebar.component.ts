import { Component, inject, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AuthStateService, SessionUser } from '../../core/auth/services/auth-state.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: SessionUser['role'][];
}

const ALL_ROLES: SessionUser['role'][] = ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'AUXILIARY'];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, AvatarComponent],
})
export class SidebarComponent {
  private readonly authState = inject(AuthStateService);

  readonly mobileOpen = input(false);
  readonly closeMenu  = output<void>();

  protected readonly user        = this.authState.user;
  protected readonly isCollapsed = signal(false);

  private readonly allNavItems: NavItem[] = [
    { label: 'Dashboard',         route: '/dashboard',          icon: '⊞',  roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { label: 'Agenda',            route: '/calendar',           icon: '📅', roles: ALL_ROLES },
    { label: 'Citas',             route: '/appointments',       icon: '📋', roles: ALL_ROLES },
    { label: 'Pacientes',         route: '/patients',           icon: '👤', roles: ALL_ROLES },
    { label: 'Planes de trat.',   route: '/treatment-plans',    icon: '🦷', roles: ALL_ROLES },
    { label: 'Recetario',         route: '/prescriptions',      icon: '📝', roles: ALL_ROLES },
    { label: 'Facturación',       route: '/billing',            icon: '💰', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { label: 'Profesionales',     route: '/professionals',      icon: '🩺', roles: ['ADMIN'] },
    { label: 'Tipos de cita',     route: '/appointment-types',  icon: '🏷',  roles: ['ADMIN'] },
    { label: 'Horarios',          route: '/schedules',          icon: '🕐', roles: ['ADMIN'] },
    { label: 'Configuración',     route: '/settings',           icon: '⚙️', roles: ['ADMIN'] },
  ];

  protected readonly navItems = computed(() => {
    const role = this.user()?.role;
    if (!role) return [];
    return this.allNavItems.filter(item => item.roles.includes(role));
  });

  protected toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  protected closeMobile(): void {
    this.closeMenu.emit();
  }
}
