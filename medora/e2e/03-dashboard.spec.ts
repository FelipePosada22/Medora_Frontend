import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/setup';
import { MOCK_DASHBOARD } from './helpers/mock-data';

test.describe('Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await setupPage(page, '/dashboard');
  });

  test.describe('KPI cards', () => {
    test('shows total patients KPI', async ({ page }) => {
      await expect(page.locator('.kpi-card__value').first()).toContainText(
        String(MOCK_DASHBOARD.patients.total),
      );
    });

    test('shows 4 KPI cards', async ({ page }) => {
      await expect(page.locator('.kpi-card')).toHaveCount(4);
    });

    test('each KPI card has label and value', async ({ page }) => {
      const cards = page.locator('.kpi-card');
      for (let i = 0; i < 4; i++) {
        const card = cards.nth(i);
        await expect(card.locator('.kpi-card__label')).toBeVisible();
        await expect(card.locator('.kpi-card__value')).toBeVisible();
      }
    });
  });

  test.describe('Period selector', () => {
    test('shows period tabs', async ({ page }) => {
      await expect(page.locator('.period-tab')).toHaveCount(4);
    });

    test('period tabs have correct labels', async ({ page }) => {
      const labels = ['Hoy', 'Esta semana', 'Este mes', 'Mes anterior'];
      for (const label of labels) {
        await expect(page.locator('.period-tab', { hasText: label })).toBeVisible();
      }
    });

    test('"Este mes" is active by default', async ({ page }) => {
      await expect(page.locator('.period-tab--active')).toContainText('Este mes');
    });

    test('clicking period tab activates it', async ({ page }) => {
      await page.locator('.period-tab', { hasText: 'Esta semana' }).click();
      await expect(page.locator('.period-tab--active')).toContainText('Esta semana');
    });

    test('clicking "Hoy" tab changes active state', async ({ page }) => {
      await page.locator('.period-tab', { hasText: 'Hoy' }).click();
      await expect(page.locator('.period-tab--active')).toContainText('Hoy');
    });
  });

  test.describe('Period stats strip', () => {
    test('shows stats strip with period data', async ({ page }) => {
      await expect(page.locator('.stats-strip')).toBeVisible();
      await expect(page.locator('.stat-cell')).toHaveCount(4);
    });
  });

  test.describe('Bar chart', () => {
    test('shows appointment bar chart', async ({ page }) => {
      await expect(page.locator('.bar-chart')).toBeVisible();
      await expect(page.locator('.bar-chart__bar').first()).toBeVisible();
    });
  });

  test.describe("Today's appointments", () => {
    test('shows today\'s appointments section', async ({ page }) => {
      await expect(page.locator('.section-title', { hasText: 'Citas de hoy' })).toBeVisible();
    });

    test('shows appointment rows', async ({ page }) => {
      await expect(page.locator('.appt-row').first()).toBeVisible();
    });

    test('each appointment row shows time, patient, and type', async ({ page }) => {
      const row = page.locator('.appt-row').first();
      await expect(row.locator('.appt-row__time')).toBeVisible();
      await expect(row.locator('.appt-row__patient')).toBeVisible();
      await expect(row.locator('.appt-row__type')).toBeVisible();
    });

    test('shows badge with appointment status', async ({ page }) => {
      await expect(page.locator('.appt-row app-badge').first()).toBeVisible();
    });
  });

  test.describe('Sidebar panels', () => {
    test('shows top professionals panel', async ({ page }) => {
      await expect(page.locator('.section-title', { hasText: 'Top profesionales' })).toBeVisible();
      await expect(page.locator('.pro-item').first()).toBeVisible();
    });

    test('pro item shows rank, name, specialty, and count', async ({ page }) => {
      const item = page.locator('.pro-item').first();
      await expect(item.locator('.pro-item__rank')).toBeVisible();
      await expect(item.locator('.pro-item__name')).toContainText('Dr. Juan García');
      await expect(item.locator('.pro-item__spec')).toBeVisible();
      await expect(item.locator('.pro-item__count')).toBeVisible();
    });

    test('shows pending invoices panel', async ({ page }) => {
      await expect(page.locator('.section-title', { hasText: 'Facturas pendientes' })).toBeVisible();
      await expect(page.locator('.inv-item').first()).toBeVisible();
    });

    test('pending invoice shows patient name and amount', async ({ page }) => {
      const item = page.locator('.inv-item').first();
      await expect(item.locator('.inv-item__name')).toContainText('María González');
      await expect(item.locator('.inv-item__amount')).toBeVisible();
    });
  });

  test.describe('Loading state', () => {
    test('shows loading state while fetching data', async ({ page }) => {
      let resolve!: () => void;
      await page.route('http://localhost:3000/dashboard**', async (r) => {
        await new Promise<void>(res => { resolve = res; });
        await r.fulfill({ json: MOCK_DASHBOARD });
      });

      await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        const { ADMIN_TOKEN } = require('./helpers/fake-jwt');
        localStorage.setItem('medora_access_token', ADMIN_TOKEN);
      });
      await page.goto('/dashboard');
      await expect(page.locator('.state-placeholder', { hasText: 'Cargando' })).toBeVisible();
      resolve();
    });
  });
});
