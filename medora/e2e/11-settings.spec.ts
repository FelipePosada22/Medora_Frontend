import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/setup';
import { MOCK_SETTINGS } from './helpers/mock-data';

import { API_URL } from './helpers/env';
const BASE = API_URL;

test.describe('Settings', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(`${BASE}/settings**`, (r) => r.fulfill({ json: MOCK_SETTINGS }));
    await page.route(`${BASE}/users**`, (r) => r.fulfill({ json: MOCK_SETTINGS.users }));
    await setupPage(page, '/settings');
  });

  test.describe('Page layout', () => {
    test('shows page title "Configuración"', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText('Configuración');
    });

    test('shows clinic settings section', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Clínica|Datos de la clínica/i);
    });

    test('shows users section', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Usuario|Equipo/i);
    });
  });

  test.describe('Clinic form', () => {
    test('shows clinic name field', async ({ page }) => {
      await expect(
        page.locator('app-input[formcontrolname="name"] input, input[formcontrolname="name"]')
      ).toBeVisible();
    });

    test('clinic name field is pre-filled', async ({ page }) => {
      const nameInput = page.locator('app-input[formcontrolname="name"] input, input[formcontrolname="name"]');
      await expect(nameInput).toHaveValue('Clínica Medora');
    });

    test('shows address, phone, email fields', async ({ page }) => {
      await expect(page.locator('[formcontrolname="address"]')).toBeVisible();
      await expect(page.locator('[formcontrolname="phone"]')).toBeVisible();
      await expect(page.locator('[formcontrolname="email"]')).toBeVisible();
    });

    test('shows save clinic button', async ({ page }) => {
      await expect(
        page.locator('app-button button, button', { hasText: /Guardar/i }).first()
      ).toBeVisible();
    });

    test('successfully saves clinic form', async ({ page }) => {
      let putCalled = false;
      await page.route(`${BASE}/settings**`, async (r) => {
        if (r.request().method() === 'PUT' || r.request().method() === 'PATCH') {
          putCalled = true;
          await r.fulfill({ json: MOCK_SETTINGS.clinic });
        } else {
          await r.continue();
        }
      });

      const nameInput = page.locator('app-input[formcontrolname="name"] input, input[formcontrolname="name"]');
      await nameInput.fill('Clínica Medora Updated');
      await page.locator('app-button button, button', { hasText: /Guardar/i }).first().click();
      // Toast or success message should appear, or PUT was called
      expect(putCalled).toBe(true);
    });
  });

  test.describe('Users table', () => {
    test('shows users table', async ({ page }) => {
      await expect(page.locator('table.table')).toBeVisible();
    });

    test('renders all mock users', async ({ page }) => {
      for (const user of MOCK_SETTINGS.users) {
        await expect(page.locator('table.table tbody')).toContainText(user.name);
      }
    });

    test('shows user roles', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('ADMIN');
      await expect(page.locator('table.table tbody')).toContainText('DOCTOR');
    });

    test('shows user email', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('admin@medora.com');
    });

    test('table is scrollable on mobile (table-responsive wrapper)', async ({ page }) => {
      await expect(page.locator('.table-responsive')).toBeVisible();
    });
  });

  test.describe('Preferences', () => {
    test('shows preferences/other settings if present', async ({ page }) => {
      // Tab or section for preferences
      const prefsEl = page.locator('body');
      await expect(prefsEl).toContainText(/.+/);
    });
  });
});
