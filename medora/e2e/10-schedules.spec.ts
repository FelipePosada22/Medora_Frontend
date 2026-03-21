import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/setup';
import { MOCK_PROFESSIONALS, MOCK_SCHEDULES } from './helpers/mock-data';

import { API_URL } from './helpers/env';
const BASE = API_URL;
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

test.describe('Schedules', () => {

  test.beforeEach(async ({ page }) => {
    await setupPage(page, '/schedules');
  });

  test.describe('Page layout', () => {
    test('shows page title "Horarios"', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText('Horarios');
    });

    test('shows professional selector', async ({ page }) => {
      await expect(page.locator('select')).toBeVisible();
    });

    test('professional selector includes mock professionals', async ({ page }) => {
      const select = page.locator('select').first();
      await expect(select.locator('option', { hasText: 'Dr. Juan García' })).toBeAttached();
    });
  });

  test.describe('Schedule grid', () => {
    test('shows weekly schedule grid with day columns', async ({ page }) => {
      for (const day of DAYS.slice(0, 5)) { // Mon-Fri
        await expect(page.locator('body')).toContainText(day);
      }
    });

    test('shows schedule slots for mock data', async ({ page }) => {
      // Should show start and end times
      await expect(page.locator('body')).toContainText('08:00');
    });
  });

  test.describe('Professional filter', () => {
    test('changing professional reloads schedule', async ({ page }) => {
      const select = page.locator('select').first();
      await select.selectOption({ label: 'Dra. Ana Flores' });
      // Schedule should update
      await expect(page.locator('.state-placeholder, table, .schedule-grid').first()).toBeVisible();
    });
  });

  test.describe('Add/edit schedule', () => {
    test('shows add schedule button or controls', async ({ page }) => {
      await expect(
        page.locator('app-button', { hasText: /Agregar|Nuevo|Guardar/i }).first()
      ).toBeVisible();
    });
  });
});
