import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/setup';
import { MOCK_PRESCRIPTIONS } from './helpers/mock-data';

import { API_URL } from './helpers/env';
const BASE = API_URL;

test.describe('Prescriptions', () => {

  test.beforeEach(async ({ page }) => {
    await setupPage(page, '/prescriptions');
  });

  test.describe('Page layout', () => {
    test('shows page title "Recetario"', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText(/Receta/i);
    });

    test('shows "Nueva receta" button', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: /Nueva receta|Nuevo/i })).toBeVisible();
    });

    test('shows search input', async ({ page }) => {
      await expect(page.locator('input.search-input')).toBeVisible();
    });
  });

  test.describe('Prescriptions table', () => {
    test('renders prescriptions in table', async ({ page }) => {
      await expect(page.locator('table.table tbody tr')).toHaveCount({ min: 1 });
    });

    test('shows patient name', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('María González');
    });

    test('shows prescribing professional', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText('Dr. Juan García');
    });

    test('shows creation date', async ({ page }) => {
      await expect(page.locator('table.table tbody td').first()).toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('search filters prescriptions by patient name', async ({ page }) => {
      await page.locator('input.search-input').fill('María');
      await expect(page.locator('table.table tbody')).toContainText('María González');
    });

    test('no results shows empty state', async ({ page }) => {
      await page.locator('input.search-input').fill('ZZZNOMATCH');
      await expect(page.locator('.state-placeholder')).toBeVisible();
    });
  });

  test.describe('Create prescription', () => {
    test('navigates to new prescription form', async ({ page }) => {
      await page.locator('app-button', { hasText: /Nueva receta|Nuevo/i }).click();
      await expect(page).toHaveURL(/\/prescriptions\/new/);
    });
  });

  test.describe('Prescription detail / print', () => {
    test('shows view/detail button for each prescription row', async ({ page }) => {
      const firstRow = page.locator('table.table tbody tr').first();
      await expect(firstRow.locator('.row-actions')).toBeVisible();
    });
  });
});
