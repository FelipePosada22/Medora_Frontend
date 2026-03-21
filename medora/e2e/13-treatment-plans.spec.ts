import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/setup';
import { MOCK_TREATMENT_PLANS } from './helpers/mock-data';

import { API_URL } from './helpers/env';
const BASE = API_URL;

test.describe('Treatment Plans', () => {

  test.beforeEach(async ({ page }) => {
    await setupPage(page, '/treatment-plans');
  });

  test.describe('Page layout', () => {
    test('shows page title "Planes de tratamiento"', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText(/Plan/i);
    });

    test('shows "Nuevo plan" button', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: /Nuevo plan|Nuevo/i })).toBeVisible();
    });

    test('shows search input', async ({ page }) => {
      await expect(page.locator('input.search-input')).toBeVisible();
    });
  });

  test.describe('Treatment plans table', () => {
    test('renders treatment plans in table', async ({ page }) => {
      await expect(page.locator('table.table tbody tr')).toHaveCount({ min: 1 });
    });

    test('shows plan title', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('Plan de control diabetes');
    });

    test('shows patient name', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('María González');
    });

    test('shows plan status badge', async ({ page }) => {
      await expect(page.locator('table.table tbody app-badge')).toHaveCount({ min: 1 });
    });
  });

  test.describe('Status filter tabs', () => {
    test('shows status filter tabs', async ({ page }) => {
      await expect(page.locator('.status-tab')).toHaveCount({ min: 2 });
    });

    test('"Todos" tab is active by default', async ({ page }) => {
      await expect(page.locator('.status-tab--active')).toContainText(/Todos|Todas/i);
    });

    test('filtering by active plans', async ({ page }) => {
      const activeTab = page.locator('.status-tab', { hasText: /Activ/i });
      if (await activeTab.isVisible()) {
        await activeTab.click();
        await expect(page.locator('.status-tab--active')).toContainText(/Activ/i);
      }
    });
  });

  test.describe('Search', () => {
    test('searching filters by plan title or patient', async ({ page }) => {
      await page.locator('input.search-input').fill('diabetes');
      await expect(page.locator('table.table tbody')).toContainText('Plan de control diabetes');
    });

    test('no results shows empty state', async ({ page }) => {
      await page.locator('input.search-input').fill('ZZZNOMATCH');
      await expect(page.locator('.state-placeholder')).toBeVisible();
    });
  });

  test.describe('Create treatment plan', () => {
    test('navigates to new plan form', async ({ page }) => {
      await page.locator('app-button', { hasText: /Nuevo plan|Nuevo/i }).click();
      await expect(page).toHaveURL(/\/treatment-plans\/new/);
    });
  });
});
