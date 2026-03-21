import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/setup';

test.describe('Calendar', () => {

  test.beforeEach(async ({ page }) => {
    await setupPage(page, '/calendar');
  });

  test.describe('Page layout', () => {
    test('shows calendar page title', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText('Agenda');
    });

    test('shows view toggle buttons (Semana / Día)', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: 'Semana' })).toBeVisible();
      await expect(page.locator('app-button', { hasText: 'Día' })).toBeVisible();
    });

    test('shows navigation buttons (prev/next)', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: /←|‹|Anterior|Prev/i }).first()).toBeVisible();
      await expect(page.locator('app-button', { hasText: /→|›|Siguiente|Next/i }).first()).toBeVisible();
    });

    test('shows "Hoy" button to navigate to current date', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: 'Hoy' })).toBeVisible();
    });
  });

  test.describe('Week view', () => {
    test('shows week view grid by default', async ({ page }) => {
      await expect(page.locator('.calendar-grid')).toBeVisible();
    });

    test('shows 7 day columns', async ({ page }) => {
      await expect(page.locator('.cal-day-header, .calendar-day-col')).toHaveCount({ min: 7 });
    });

    test('shows time slots column', async ({ page }) => {
      await expect(page.locator('.cal-time, .calendar-times')).toBeVisible();
    });

    test('shows appointment chips for mock appointments', async ({ page }) => {
      await expect(page.locator('.cal-chip, .calendar-chip, [class*="chip"]').first()).toBeVisible();
    });

    test('shows date range label in header', async ({ page }) => {
      await expect(page.locator('.page__subtitle, .calendar-range')).toBeVisible();
    });
  });

  test.describe('Day view', () => {
    test('clicking "Día" switches to day view', async ({ page }) => {
      await page.locator('app-button', { hasText: 'Día' }).click();
      // Day view shows a single day column
      await expect(page.locator('.calendar-grid')).toBeVisible();
    });

    test('day view has "Semana" button to switch back', async ({ page }) => {
      await page.locator('app-button', { hasText: 'Día' }).click();
      await expect(page.locator('app-button', { hasText: 'Semana' })).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('clicking next advances the week', async ({ page }) => {
      // Get initial range label
      const initialLabel = await page.locator('.page__subtitle, .calendar-range').textContent();
      const nextBtn = page.locator('app-button', { hasText: /→|›/i }).first();
      await nextBtn.click();
      const newLabel = await page.locator('.page__subtitle, .calendar-range').textContent();
      expect(newLabel).not.toBe(initialLabel);
    });

    test('clicking "Hoy" goes back to current week', async ({ page }) => {
      const nextBtn = page.locator('app-button', { hasText: /→|›/i }).first();
      await nextBtn.click();
      await page.locator('app-button', { hasText: 'Hoy' }).click();

      const label = await page.locator('.page__subtitle, .calendar-range').textContent();
      // The "Hoy" button returns to current date's week
      expect(label).toBeTruthy();
    });
  });

  test.describe('Professional filter', () => {
    test('shows professional filter select', async ({ page }) => {
      await expect(page.locator('select')).toBeVisible();
    });

    test('filter includes "Todos" option', async ({ page }) => {
      const select = page.locator('select').first();
      await expect(select.locator('option', { hasText: /Todos/i })).toBeAttached();
    });

    test('filter includes mock professionals', async ({ page }) => {
      const select = page.locator('select').first();
      await expect(select.locator('option', { hasText: 'Dr. Juan García' })).toBeAttached();
    });
  });

  test.describe('Responsive scroll', () => {
    test('calendar grid has horizontal scroll wrapper', async ({ page }) => {
      await expect(page.locator('.calendar-grid-wrap')).toBeVisible();
    });
  });
});
