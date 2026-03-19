import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

/**
 * Root shell for all authenticated routes.
 * Composes the sidebar, header, and main content area via router-outlet.
 */
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  styles: [`
    .layout {
      display: flex;
      height: 100dvh;
      overflow: hidden;
    }
    .layout__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .layout__main {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-6);
    }

    /* Sidebar — blanco con borde derecho (fiel al Figma) */
    :host ::ng-deep .sidebar {
      width: var(--sidebar-width);
      height: 100dvh;
      background: var(--color-sidebar);          // #ffffff
      border-right: 1px solid var(--color-sidebar-border);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-normal);
      overflow: hidden;
      flex-shrink: 0;
    }
    :host ::ng-deep .sidebar--collapsed { width: var(--sidebar-collapsed-width); }

    :host ::ng-deep .sidebar__brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--color-border);
      min-height: 92px;
    }
    :host ::ng-deep .sidebar__logo {
      width: 40px; height: 40px;
      background: var(--color-primary-600);      // #6324eb
      color: white;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-lg);
      flex-shrink: 0;
    }
    :host ::ng-deep .sidebar__brand-name {
      color: var(--color-text-primary);           // #0f172a
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-2xl);            // 20px
      line-height: 1.4;
    }
    :host ::ng-deep .sidebar__brand-sub {
      color: var(--color-text-muted);             // #64748b
      font-size: var(--font-size-sm);             // 12px
      font-weight: var(--font-weight-medium);
    }
    :host ::ng-deep .sidebar__toggle {
      margin-left: auto;
      color: var(--color-text-tertiary);
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      &:hover { color: var(--color-text-primary); background: var(--color-sidebar-hover); }
    }

    :host ::ng-deep .sidebar__nav {
      flex: 1;
      padding: var(--space-4) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      overflow-y: auto;
    }
    :host ::ng-deep .sidebar__link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2-5, 10px) var(--space-3);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);         // #475569 inactivo
      font-size: var(--font-size-base);           // 14px
      font-weight: var(--font-weight-medium);
      transition: background var(--transition-fast), color var(--transition-fast);
      &:hover {
        background: var(--color-sidebar-hover);   // violeta muy claro
        color: var(--color-primary-600);
      }
    }
    :host ::ng-deep .sidebar__link--active {
      background: var(--color-primary-50);        // fondo violeta muy sutil
      color: var(--color-primary-600);            // #6324eb activo
      font-weight: var(--font-weight-semibold);
    }

    :host ::ng-deep .sidebar__user {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border);
      background: var(--color-neutral-50);
    }
    :host ::ng-deep .sidebar__user-name {
      display: block;
      color: var(--color-text-primary);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
    }
    :host ::ng-deep .sidebar__user-role {
      display: block;
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
    }

    /* Header styles */
    :host ::ng-deep .header {
      height: var(--header-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-6);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    :host ::ng-deep .header__title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    :host ::ng-deep .header__user-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      &:hover { background: var(--color-neutral-100); }
    }
    :host ::ng-deep .header__user-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    :host ::ng-deep .header__chevron {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      transition: transform var(--transition-fast);
      line-height: 1;
    }
    :host ::ng-deep .header__chevron--open {
      transform: rotate(180deg);
    }

    /* Dropdown */
    :host ::ng-deep .header__user-menu {
      position: relative;
    }
    :host ::ng-deep .header__backdrop {
      position: fixed;
      inset: 0;
      z-index: 10;
    }
    :host ::ng-deep .header__dropdown {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      min-width: 220px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: 0 8px 24px rgba(0,0,0,.1);
      z-index: 11;
      overflow: hidden;
    }
    :host ::ng-deep .header__dropdown-user {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
    }
    :host ::ng-deep .header__dropdown-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    :host ::ng-deep .header__dropdown-role {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: 1px;
    }
    :host ::ng-deep .header__dropdown-divider {
      border: none;
      border-top: 1px solid var(--color-border);
      margin: 0;
    }
    :host ::ng-deep .header__dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      width: 100%;
      padding: var(--space-3) var(--space-4);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: background var(--transition-fast);
      &:hover { background: var(--color-neutral-50); }
    }
    :host ::ng-deep .header__dropdown-item--danger {
      color: var(--color-error-600);
      &:hover { background: var(--color-error-50, #fef2f2); }
    }
  `],
})
export class MainLayoutComponent {}
