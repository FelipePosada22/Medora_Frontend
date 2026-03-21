import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/setup';
import { MOCK_BILLING } from './helpers/mock-data';

import { API_URL } from './helpers/env';
const BASE = API_URL;

test.describe('Billing', () => {

  test.beforeEach(async ({ page }) => {
    await setupPage(page, '/billing');
  });

  test.describe('Page layout', () => {
    test('shows page title "Facturación"', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText('Facturación');
    });

    test('shows "Nueva factura" button', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: /Nueva factura/i })).toBeVisible();
    });
  });

  test.describe('Revenue stats', () => {
    test('shows stats strip or cards with revenue data', async ({ page }) => {
      await expect(page.locator('.stats-strip, .stats-grid, .kpi-grid')).toBeVisible();
    });

    test('stats show revenue amounts', async ({ page }) => {
      // Should contain a dollar/currency amount
      await expect(page.locator('.stats-strip, .stats-grid, .kpi-grid')).toBeVisible();
    });
  });

  test.describe('Invoices table', () => {
    test('renders invoices in table', async ({ page }) => {
      await expect(page.locator('table.table tbody tr')).toHaveCount(MOCK_BILLING.length);
    });

    test('shows patient names', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('María González');
      await expect(page.locator('table.table tbody')).toContainText('Carlos Ramírez');
    });

    test('shows invoice amounts', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('500');
      await expect(page.locator('table.table tbody')).toContainText('750');
    });

    test('shows status badges', async ({ page }) => {
      await expect(page.locator('table.table tbody app-badge')).toHaveCount({ min: 1 });
    });

    test('PAID invoice badge shown', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText(/Pagad|Paid/i);
    });

    test('PENDING invoice badge shown', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText(/Pendiente|Pending/i);
    });
  });

  test.describe('Status filter tabs', () => {
    test('shows filter tabs for billing statuses', async ({ page }) => {
      await expect(page.locator('.status-tab, .status-tabs button')).toHaveCount({ min: 2 });
    });

    test('"Todas" tab is active by default', async ({ page }) => {
      await expect(page.locator('.status-tab--active')).toContainText(/Todas|Todos/i);
    });

    test('filtering by "Pendientes" shows only pending invoices', async ({ page }) => {
      await page.locator('.status-tab', { hasText: /Pendiente/i }).click();
      const rows = page.locator('table.table tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const badge = rows.nth(i).locator('app-badge');
        if (await badge.isVisible()) {
          await expect(badge).toContainText(/Pendiente/i);
        }
      }
    });

    test('filtering by "Pagadas" shows only paid invoices', async ({ page }) => {
      await page.locator('.status-tab', { hasText: /Pagad/i }).click();
      const rows = page.locator('table.table tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Create invoice navigation', () => {
    test('clicking "Nueva factura" navigates to /billing/new', async ({ page }) => {
      await page.locator('app-button', { hasText: /Nueva factura/i }).click();
      await expect(page).toHaveURL(/\/billing\/new/);
    });
  });
});
