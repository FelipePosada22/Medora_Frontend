import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { BadgeComponent, BadgeVariant } from '../../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

type SettingsTab = 'clinic' | 'users' | 'preferences';

interface SystemUser {
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  active: boolean;
}

/**
 * Settings page.
 * Tabs: clinic info form, user management, system preferences.
 */
@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent, BadgeComponent, AvatarComponent],
  styles: [`
    .settings-layout {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--space-6);
      align-items: start;
    }
    @media (max-width: 768px) { .settings-layout { grid-template-columns: 1fr; } }

    .settings-nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
    .settings-nav-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: all var(--transition-fast);
      &:hover { background: var(--color-neutral-100); color: var(--color-text-primary); }
    }
    .settings-nav-btn--active {
      background: var(--color-primary-50);
      color: var(--color-primary-600);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
    @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }

    .form-field { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); }
    .form-select {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      background: var(--color-surface);
      outline: none;
      &:focus { border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-100); }
    }

    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
    }
    .toggle-info { display: flex; flex-direction: column; gap: 2px; }
    .toggle-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-primary); }
    .toggle-desc { font-size: var(--font-size-xs); color: var(--color-text-muted); }
    .toggle {
      position: relative; width: 44px; height: 24px;
      input { opacity: 0; width: 0; height: 0; position: absolute; }
    }
    .toggle-track {
      position: absolute; inset: 0;
      background: var(--color-neutral-300);
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .toggle-track::after {
      content: '';
      position: absolute;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: white;
      top: 3px; left: 3px;
      transition: transform var(--transition-fast);
    }
    input:checked + .toggle-track { background: var(--color-primary-600); }
    input:checked + .toggle-track::after { transform: translateX(20px); }
  `],
})
export class SettingsPageComponent {
  private readonly fb = new FormBuilder();

  protected readonly activeTab  = signal<SettingsTab>('clinic');
  protected readonly isSaving   = signal(false);
  protected readonly savedOk    = signal(false);

  protected readonly tabs: { label: string; icon: string; value: SettingsTab }[] = [
    { label: 'Clínica',       icon: '🏥', value: 'clinic'      },
    { label: 'Usuarios',      icon: '👥', value: 'users'       },
    { label: 'Preferencias',  icon: '⚙️', value: 'preferences' },
  ];

  protected readonly clinicForm = this.fb.group({
    name:     ['Medora Dental Clinic', Validators.required],
    phone:    ['+1 555-0100',          Validators.required],
    email:    ['info@medora.com',      [Validators.required, Validators.email]],
    address:  ['123 Main St, Miami, FL'],
    timezone: ['America/New_York'],
    currency: ['USD'],
  });

  protected readonly users: SystemUser[] = [
    { name: 'Dr. Julian Smith',  email: 'j.smith@medora.com',  role: 'DOCTOR',       active: true  },
    { name: 'Dra. Elena Lopez',  email: 'e.lopez@medora.com',  role: 'DOCTOR',       active: true  },
    { name: 'Admin User',        email: 'admin@medora.com',    role: 'ADMIN',        active: true  },
    { name: 'Recepción',         email: 'recep@medora.com',    role: 'RECEPTIONIST', active: true  },
    { name: 'Dr. Marc Rivera',   email: 'm.rivera@medora.com', role: 'DOCTOR',       active: false },
  ];

  protected readonly preferences = signal({
    emailNotifications:  true,
    smsReminders:        false,
    autoConfirm:         true,
    darkMode:            false,
    twoFactor:           false,
  });

  protected setTab(t: SettingsTab): void { this.activeTab.set(t); }

  protected saveClinic(): void {
    if (this.clinicForm.invalid) return;
    this.isSaving.set(true);
    setTimeout(() => { this.isSaving.set(false); this.savedOk.set(true); setTimeout(() => this.savedOk.set(false), 3000); }, 1200);
  }

  protected roleVariant(role: SystemUser['role']): BadgeVariant {
    if (role === 'ADMIN')  return 'warning';
    if (role === 'DOCTOR') return 'info';
    return 'default';
  }

  protected togglePref(key: keyof ReturnType<typeof this.preferences>): void {
    this.preferences.update(p => ({ ...p, [key]: !p[key] }));
  }
}
