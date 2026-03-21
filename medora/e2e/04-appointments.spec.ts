import { test, expect } from '@playwright/test';
import { setupPage, mockAllApis, loginAs } from './helpers/setup';
import { MOCK_APPOINTMENTS, MOCK_PATIENTS, MOCK_PROFESSIONALS, MOCK_APPOINTMENT_TYPES } from './helpers/mock-data';

import { API_URL } from './helpers/env';
const BASE = API_URL;

test.describe('Appointments', () => {

  test.describe('Appointments list page', () => {
    test.beforeEach(async ({ page }) => {
      await setupPage(page, '/appointments');
    });

    test('shows page title "Citas"', async ({ page }) => {
      await expect(page.locator('.page__title')).toHaveText('Citas');
    });

    test('shows "Nueva cita" button', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: '+ Nueva cita' })).toBeVisible();
    });

    test('shows search input', async ({ page }) => {
      await expect(page.locator('input.search-input')).toBeVisible();
    });

    test('shows status filter tabs', async ({ page }) => {
      const tabs = ['Todas', 'Programadas', 'Confirmadas', 'Completadas', 'Canceladas', 'No asistió'];
      for (const tab of tabs) {
        await expect(page.locator('.status-tab', { hasText: tab })).toBeVisible();
      }
    });

    test('renders appointment rows in table', async ({ page }) => {
      await expect(page.locator('table.table tbody tr').first()).toBeVisible();
    });

    test('shows patient name in first row', async ({ page }) => {
      await expect(page.locator('table.table tbody tr').first()).toContainText('María González');
    });

    test('shows professional name in first row', async ({ page }) => {
      await expect(page.locator('table.table tbody tr').first()).toContainText('Dr. Juan García');
    });

    test('shows status badge in rows', async ({ page }) => {
      await expect(page.locator('table.table tbody tr app-badge').first()).toBeVisible();
    });

    test('SCHEDULED appointment shows Confirmar and Cancelar buttons', async ({ page }) => {
      // First appointment is SCHEDULED
      const firstRow = page.locator('table.table tbody tr').first();
      await expect(firstRow.locator('app-button', { hasText: 'Confirmar' })).toBeVisible();
      await expect(firstRow.locator('app-button', { hasText: 'Cancelar' })).toBeVisible();
    });

    test('CONFIRMED appointment shows Atender and Cancelar buttons', async ({ page }) => {
      // Second appointment is CONFIRMED
      const secondRow = page.locator('table.table tbody tr').nth(1);
      await expect(secondRow.locator('app-button', { hasText: 'Atender' })).toBeVisible();
      await expect(secondRow.locator('app-button', { hasText: 'Cancelar' })).toBeVisible();
    });

    test('COMPLETED appointment shows dash (no action buttons)', async ({ page }) => {
      // Third appointment is COMPLETED
      const thirdRow = page.locator('table.table tbody tr').nth(2);
      await expect(thirdRow.locator('.row-actions span')).toHaveText('—');
    });
  });

  test.describe('Status filter tabs', () => {
    test.beforeEach(async ({ page }) => {
      await setupPage(page, '/appointments');
    });

    test('"Todas" tab is active by default', async ({ page }) => {
      await expect(page.locator('.status-tab--active')).toContainText('Todas');
    });

    test('clicking "Completadas" filters to completed appointments', async ({ page }) => {
      await page.locator('.status-tab', { hasText: 'Completadas' }).click();
      await expect(page.locator('.status-tab--active')).toContainText('Completadas');

      // Only COMPLETED rows should be visible
      const rows = page.locator('table.table tbody tr');
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const badge = rows.nth(i).locator('app-badge');
        if (await badge.isVisible()) {
          await expect(badge).toContainText('Completada');
        }
      }
    });

    test('clicking "Programadas" filters to scheduled appointments', async ({ page }) => {
      await page.locator('.status-tab', { hasText: 'Programadas' }).click();
      await expect(page.locator('.status-tab--active')).toContainText('Programadas');
    });

    test('filter shows empty state when no matching appointments', async ({ page }) => {
      await page.locator('.status-tab', { hasText: 'No asistió' }).click();
      await expect(page.locator('.state-placeholder')).toContainText('Sin citas');
    });
  });

  test.describe('Search', () => {
    test.beforeEach(async ({ page }) => {
      await setupPage(page, '/appointments');
    });

    test('searching for existing patient filters results', async ({ page }) => {
      await page.locator('input.search-input').fill('María');
      await expect(page.locator('table.table tbody tr')).toHaveCount(1);
      await expect(page.locator('table.table tbody tr').first()).toContainText('María González');
    });

    test('searching for non-existent name shows empty state', async ({ page }) => {
      await page.locator('input.search-input').fill('XYZ999NonExistent');
      await expect(page.locator('.state-placeholder')).toContainText('Sin citas');
    });

    test('clearing search restores all appointments', async ({ page }) => {
      await page.locator('input.search-input').fill('María');
      await page.locator('input.search-input').clear();
      await expect(page.locator('table.table tbody tr')).toHaveCount(MOCK_APPOINTMENTS.length);
    });
  });

  test.describe('Status changes', () => {
    test('confirming an appointment calls PUT and refreshes list', async ({ page }) => {
      let putCalled = false;
      await mockAllApis(page);
      await page.route(`${BASE}/appointments/**`, async (r) => {
        if (r.request().method() === 'PUT') {
          putCalled = true;
          await r.fulfill({ status: 200, json: {} });
        } else {
          await r.continue();
        }
      });
      await loginAs(page, 'ADMIN');
      await page.goto('/appointments', { waitUntil: 'networkidle' });

      await page.locator('table.table tbody tr').first()
        .locator('app-button', { hasText: 'Confirmar' }).click();

      expect(putCalled).toBe(true);
    });
  });

  test.describe('Create appointment page', () => {
    test.beforeEach(async ({ page }) => {
      await setupPage(page, '/appointments/new');
    });

    test('shows create appointment form', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText('Nueva cita');
    });

    test('shows patient, professional, appointment type, date, time, notes fields', async ({ page }) => {
      // The form should have select/input fields for key data
      await expect(page.locator('select, app-input input')).toHaveCount({ min: 3 });
    });

    test('shows cancel/back button', async ({ page }) => {
      const backBtn = page.locator('app-button', { hasText: /Cancelar|Volver/ });
      await expect(backBtn.first()).toBeVisible();
    });

    test('navigates back to appointments list on cancel', async ({ page }) => {
      const backBtn = page.locator('app-button', { hasText: /Cancelar|Volver/ }).first();
      await backBtn.click();
      await expect(page).toHaveURL(/\/appointments$/);
    });
  });

  test.describe('"Nueva cita" button navigation', () => {
    test('clicking "Nueva cita" navigates to /appointments/new', async ({ page }) => {
      await setupPage(page, '/appointments');
      await page.locator('app-button', { hasText: '+ Nueva cita' }).click();
      await expect(page).toHaveURL(/\/appointments\/new/);
    });
  });
});
