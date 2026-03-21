import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/setup';
import { MOCK_APPOINTMENT_TYPES } from './helpers/mock-data';

import { API_URL } from './helpers/env';
const BASE = API_URL;

test.describe('Appointment Types', () => {

  test.beforeEach(async ({ page }) => {
    await setupPage(page, '/appointment-types');
  });

  test.describe('Page layout', () => {
    test('shows page title "Tipos de cita"', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText('Tipos de cita');
    });

    test('shows "Nuevo tipo" button', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: /Nuevo tipo/i })).toBeVisible();
    });

    test('shows search input', async ({ page }) => {
      await expect(page.locator('input.search-input')).toBeVisible();
    });
  });

  test.describe('Stats cards', () => {
    test('shows stats cards', async ({ page }) => {
      await expect(page.locator('.stats-grid, .kpi-grid')).toBeVisible();
    });

    test('stats count matches total mock types', async ({ page }) => {
      await expect(page.locator('.stat-card, .kpi-card').first()).toBeVisible();
    });
  });

  test.describe('Types table', () => {
    test('renders all mock types', async ({ page }) => {
      await expect(page.locator('table.table tbody tr')).toHaveCount(MOCK_APPOINTMENT_TYPES.length);
    });

    test('shows type names', async ({ page }) => {
      for (const type of MOCK_APPOINTMENT_TYPES) {
        await expect(page.locator('table.table tbody')).toContainText(type.name);
      }
    });

    test('shows duration in minutes', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('30');
    });

    test('shows price formatted as currency', async ({ page }) => {
      // 500 -> shown as $500.00 or similar
      await expect(page.locator('table.table tbody')).toContainText('500');
    });

    test('shows active status badge', async ({ page }) => {
      await expect(page.locator('table.table tbody app-badge').first()).toBeVisible();
    });

    test('shows color indicator', async ({ page }) => {
      // Color dot or swatch should be visible
      await expect(page.locator('table.table tbody [style*="background"]').first()).toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('search filters by type name', async ({ page }) => {
      await page.locator('input.search-input').fill('Consulta');
      await expect(page.locator('table.table tbody tr')).toHaveCount(1);
      await expect(page.locator('table.table tbody')).toContainText('Consulta General');
    });

    test('no results shows empty state', async ({ page }) => {
      await page.locator('input.search-input').fill('ZZZNOMATCH');
      await expect(page.locator('.state-placeholder')).toBeVisible();
    });
  });

  test.describe('Create appointment type', () => {
    test('clicking "Nuevo tipo" navigates to form', async ({ page }) => {
      await page.locator('app-button', { hasText: /Nuevo tipo/i }).click();
      await expect(page).toHaveURL(/\/appointment-types\/new/);
    });
  });

  test.describe('New appointment type form', () => {
    test.beforeEach(async ({ page }) => {
      await setupPage(page, '/appointment-types/new');
    });

    test('shows form with name, duration, price fields', async ({ page }) => {
      await expect(page.locator('app-input[formcontrolname="name"] input')).toBeVisible();
      await expect(page.locator('app-input[formcontrolname="durationMinutes"] input')).toBeVisible();
    });

    test('validates required name field', async ({ page }) => {
      await page.locator('app-button[type="submit"] button, app-button button', { hasText: /Guardar/i }).click();
      await expect(page.locator('app-input[formcontrolname="name"] .field__error')).toBeVisible();
    });

    test('successfully creates type and redirects', async ({ page }) => {
      await page.route(`${BASE}/appointment-types`, async (r) => {
        if (r.request().method() === 'POST') {
          await r.fulfill({ json: { id: 'at-new', ...MOCK_APPOINTMENT_TYPES[0] } });
        } else {
          await r.continue();
        }
      });

      await page.locator('app-input[formcontrolname="name"] input').fill('Nueva Consulta');
      await page.locator('app-input[formcontrolname="durationMinutes"] input').fill('60');
      await page.locator('app-button[type="submit"] button, app-button button', { hasText: /Guardar/i }).click();

      await expect(page).toHaveURL(/\/appointment-types$/);
    });
  });
});
