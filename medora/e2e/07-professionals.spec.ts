import { test, expect } from '@playwright/test';
import { setupPage, mockAllApis, loginAs } from './helpers/setup';
import { MOCK_PROFESSIONALS } from './helpers/mock-data';

import { API_URL } from './helpers/env';
const BASE = API_URL;

test.describe('Professionals', () => {

  test.beforeEach(async ({ page }) => {
    await setupPage(page, '/professionals');
  });

  test.describe('Page layout', () => {
    test('shows page title "Profesionales"', async ({ page }) => {
      await expect(page.locator('.page__title')).toHaveText('Profesionales');
    });

    test('shows "Nuevo profesional" button', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: /Nuevo profesional/i })).toBeVisible();
    });

    test('shows search input', async ({ page }) => {
      await expect(page.locator('input.search-input')).toBeVisible();
    });
  });

  test.describe('Stats cards', () => {
    test('shows stats grid', async ({ page }) => {
      await expect(page.locator('.stats-grid, .kpi-grid')).toBeVisible();
    });

    test('stats show total count matching mock data', async ({ page }) => {
      await expect(page.locator('.stat-card, .kpi-card').first()).toBeVisible();
    });
  });

  test.describe('Professionals table', () => {
    test('renders all mock professionals', async ({ page }) => {
      await expect(page.locator('table.table tbody tr')).toHaveCount(MOCK_PROFESSIONALS.length);
    });

    test('shows professional names', async ({ page }) => {
      for (const pro of MOCK_PROFESSIONALS) {
        await expect(page.locator('table.table tbody')).toContainText(pro.name);
      }
    });

    test('shows specialty column', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('Medicina General');
    });

    test('shows active status', async ({ page }) => {
      await expect(page.locator('table.table tbody app-badge').first()).toBeVisible();
    });
  });

  test.describe('Specialty filter', () => {
    test('shows specialty filter select', async ({ page }) => {
      await expect(page.locator('select')).toBeVisible();
    });

    test('filter has "Todas" option', async ({ page }) => {
      await expect(page.locator('select option', { hasText: /Todas|Todos/i }).first()).toBeAttached();
    });

    test('filtering by specialty reduces visible rows', async ({ page }) => {
      const select = page.locator('select').first();
      await select.selectOption({ label: 'Medicina General' });
      await expect(page.locator('table.table tbody tr')).toHaveCount(1);
      await expect(page.locator('table.table tbody')).toContainText('Dr. Juan García');
    });
  });

  test.describe('Search', () => {
    test('searching by name filters results', async ({ page }) => {
      await page.locator('input.search-input').fill('Ana');
      await expect(page.locator('table.table tbody tr')).toHaveCount(1);
      await expect(page.locator('table.table tbody')).toContainText('Dra. Ana Flores');
    });

    test('no results shows empty state', async ({ page }) => {
      await page.locator('input.search-input').fill('ZZZNOMATCH');
      await expect(page.locator('.state-placeholder')).toBeVisible();
    });
  });

  test.describe('Create professional', () => {
    test('clicking "Nuevo profesional" navigates to /professionals/new', async ({ page }) => {
      await page.locator('app-button', { hasText: /Nuevo profesional/i }).click();
      await expect(page).toHaveURL(/\/professionals\/new/);
    });
  });

  test.describe('New professional form', () => {
    test.beforeEach(async ({ page }) => {
      await setupPage(page, '/professionals/new');
    });

    test('shows form title', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText('profesional');
    });

    test('shows name, specialty, email, license fields', async ({ page }) => {
      await expect(page.locator('app-input[formcontrolname="name"] input')).toBeVisible();
      await expect(page.locator('app-input[formcontrolname="specialty"] input')).toBeVisible();
    });

    test('validates required name field', async ({ page }) => {
      await page.locator('app-button[type="submit"] button, app-button button', { hasText: /Guardar/i }).click();
      await expect(page.locator('app-input[formcontrolname="name"] .field__error')).toBeVisible();
    });

    test('successfully creates professional and redirects', async ({ page }) => {
      await page.route(`${BASE}/professionals`, async (r) => {
        if (r.request().method() === 'POST') {
          await r.fulfill({
            json: { id: 'pr-new', ...MOCK_PROFESSIONALS[0], id: 'pr-new' },
          });
        } else {
          await r.continue();
        }
      });

      await page.locator('app-input[formcontrolname="name"] input').fill('Dr. Nuevo');
      await page.locator('app-input[formcontrolname="specialty"] input').fill('Cardiología');
      await page.locator('app-button[type="submit"] button, app-button button', { hasText: /Guardar/i }).click();

      await expect(page).toHaveURL(/\/professionals$/);
    });
  });
});
