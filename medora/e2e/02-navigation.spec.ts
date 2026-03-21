import { test, expect } from '@playwright/test';
import { setupPage, loginAs, mockAllApis } from './helpers/setup';

test.describe('Navigation & Layout', () => {

  test.describe('Sidebar navigation', () => {
    test('shows Medora brand in sidebar', async ({ page }) => {
      await setupPage(page, '/dashboard');
      await expect(page.locator('.sidebar__brand-name')).toHaveText('Medora');
      await expect(page.locator('.sidebar__logo')).toHaveText('M');
    });

    test('shows user info in sidebar footer', async ({ page }) => {
      await setupPage(page, '/dashboard');
      await expect(page.locator('.sidebar__user-name')).toBeVisible();
      await expect(page.locator('.sidebar__user-role')).toBeVisible();
    });

    test('ADMIN sees all nav items', async ({ page }) => {
      await setupPage(page, '/dashboard', 'ADMIN');
      const expectedItems = ['Dashboard', 'Agenda', 'Citas', 'Pacientes', 'Planes de trat.', 'Recetario', 'Facturación', 'Profesionales', 'Tipos de cita', 'Horarios', 'Configuración'];
      for (const item of expectedItems) {
        await expect(page.locator('.sidebar__link', { hasText: item })).toBeVisible();
      }
    });

    test('AUXILIARY does not see Dashboard, Facturación, Profesionales, Tipos de cita, Horarios, Configuración', async ({ page }) => {
      await setupPage(page, '/calendar', 'AUXILIARY');
      const hiddenItems = ['Dashboard', 'Facturación', 'Profesionales', 'Tipos de cita', 'Horarios', 'Configuración'];
      for (const item of hiddenItems) {
        await expect(page.locator('.sidebar__link', { hasText: item })).toBeHidden();
      }
    });

    test('RECEPTIONIST sees Facturación but not Profesionales, Tipos de cita, Horarios, Configuración', async ({ page }) => {
      await setupPage(page, '/dashboard', 'RECEPTIONIST');
      await expect(page.locator('.sidebar__link', { hasText: 'Facturación' })).toBeVisible();
      for (const item of ['Profesionales', 'Tipos de cita', 'Horarios', 'Configuración']) {
        await expect(page.locator('.sidebar__link', { hasText: item })).toBeHidden();
      }
    });

    test('clicking nav item navigates to correct route', async ({ page }) => {
      await setupPage(page, '/dashboard');
      await page.locator('.sidebar__link', { hasText: 'Pacientes' }).click();
      await expect(page).toHaveURL(/\/patients/);
    });

    test('active nav link has active class', async ({ page }) => {
      await setupPage(page, '/patients');
      await expect(page.locator('.sidebar__link--active')).toContainText('Pacientes');
    });
  });

  test.describe('Sidebar collapse', () => {
    test('toggles sidebar collapse on desktop', async ({ page }) => {
      await setupPage(page, '/dashboard');
      // Initially expanded
      await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar--collapsed/);

      await page.locator('.sidebar__toggle--desktop').click();
      await expect(page.locator('.sidebar')).toHaveClass(/sidebar--collapsed/);

      // Labels hidden when collapsed
      await expect(page.locator('.sidebar__link-label').first()).toBeHidden();

      // Expand again
      await page.locator('.sidebar__toggle--desktop').click();
      await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar--collapsed/);
    });

    test('collapsed sidebar shows tooltips on nav items', async ({ page }) => {
      await setupPage(page, '/dashboard');
      await page.locator('.sidebar__toggle--desktop').click();

      // When collapsed, the title attr is set
      const firstLink = page.locator('.sidebar__link').first();
      await expect(firstLink).toHaveAttribute('title', /.+/);
    });
  });

  test.describe('Header', () => {
    test('shows page title in header', async ({ page }) => {
      await setupPage(page, '/dashboard');
      await expect(page.locator('.header__title')).toBeVisible();
    });

    test('shows user menu button', async ({ page }) => {
      await setupPage(page, '/dashboard');
      await expect(page.locator('.header__user-btn')).toBeVisible();
    });

    test('opens user dropdown on click', async ({ page }) => {
      await setupPage(page, '/dashboard');
      await page.locator('.header__user-btn').click();
      await expect(page.locator('.header__dropdown')).toBeVisible();
      await expect(page.locator('.header__dropdown-name')).toBeVisible();
      await expect(page.locator('.header__dropdown-role')).toBeVisible();
    });

    test('closes user dropdown on backdrop click', async ({ page }) => {
      await setupPage(page, '/dashboard');
      await page.locator('.header__user-btn').click();
      await expect(page.locator('.header__dropdown')).toBeVisible();
      await page.locator('.header__backdrop').click();
      await expect(page.locator('.header__dropdown')).toBeHidden();
    });
  });

  test.describe('RBAC route guards', () => {
    test('AUXILIARY redirected when accessing /dashboard', async ({ page }) => {
      await mockAllApis(page);
      await loginAs(page, 'AUXILIARY');
      // AUXILIARY goes to calendar (first allowed route)
      await expect(page).not.toHaveURL(/\/dashboard/);
    });

    test('DOCTOR redirected when accessing /professionals (ADMIN only)', async ({ page }) => {
      await mockAllApis(page);
      await loginAs(page, 'DOCTOR');
      await page.goto('/professionals');
      await expect(page).not.toHaveURL(/\/professionals/);
    });

    test('RECEPTIONIST redirected when accessing /settings (ADMIN only)', async ({ page }) => {
      await mockAllApis(page);
      await loginAs(page, 'RECEPTIONIST');
      await page.goto('/settings');
      await expect(page).not.toHaveURL(/\/settings/);
    });

    test('ADMIN can access all routes', async ({ page }) => {
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');
      for (const route of ['/dashboard', '/professionals', '/appointment-types', '/schedules', '/settings']) {
        await page.goto(route, { waitUntil: 'networkidle' });
        await expect(page).toHaveURL(new RegExp(route.replace('/', '\\/')));
      }
    });
  });
});
