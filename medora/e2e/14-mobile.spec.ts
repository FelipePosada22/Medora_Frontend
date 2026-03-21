import { test, expect, devices } from '@playwright/test';
import { setupPage, mockAllApis, loginAs } from './helpers/setup';

/** Run these tests at iPhone 12 viewport */
const iphone = devices['iPhone 12'];

test.describe('Mobile Responsiveness', () => {

  test.describe('Sidebar as mobile drawer', () => {
    test('sidebar is hidden by default on mobile', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');

      // Sidebar should not be visible / translated off-screen
      const sidebar = page.locator('.sidebar');
      const transform = await sidebar.evaluate((el) =>
        window.getComputedStyle(el).transform,
      );
      // Either hidden via transform or not visible
      const box = await sidebar.boundingBox();
      if (box) {
        expect(box.x + box.width).toBeLessThanOrEqual(0);
      }
      await context.close();
    });

    test('hamburger button is visible on mobile', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');

      await expect(page.locator('.header__hamburger')).toBeVisible();
      await context.close();
    });

    test('clicking hamburger opens sidebar drawer', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');

      await page.locator('.header__hamburger').click();
      await expect(page.locator('.sidebar')).toHaveClass(/sidebar--mobile-open/);
      await context.close();
    });

    test('clicking overlay backdrop closes sidebar', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');

      await page.locator('.header__hamburger').click();
      await expect(page.locator('.sidebar')).toHaveClass(/sidebar--mobile-open/);

      await page.locator('.layout__overlay').click();
      await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar--mobile-open/);
      await context.close();
    });

    test('clicking close button (✕) in sidebar closes it', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');

      await page.locator('.header__hamburger').click();
      await page.locator('.sidebar__toggle--mobile').click();
      await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar--mobile-open/);
      await context.close();
    });

    test('navigating via sidebar link closes the drawer', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');

      await page.locator('.header__hamburger').click();
      await page.locator('.sidebar__link', { hasText: 'Pacientes' }).click();
      await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar--mobile-open/);
      await context.close();
    });
  });

  test.describe('Tables horizontal scroll', () => {
    test('appointments table has table-responsive wrapper', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await setupPage(page, '/appointments');
      await expect(page.locator('.table-responsive')).toBeVisible();
      await context.close();
    });

    test('patients table has table-responsive wrapper', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await setupPage(page, '/patients');
      await expect(page.locator('.table-responsive')).toBeVisible();
      await context.close();
    });

    test('billing table has table-responsive wrapper', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await setupPage(page, '/billing');
      await expect(page.locator('.table-responsive')).toBeVisible();
      await context.close();
    });
  });

  test.describe('Status tabs scroll on mobile', () => {
    test('appointments status tabs are scrollable container', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await setupPage(page, '/appointments');

      const overflow = await page.locator('.status-tabs').evaluate((el) =>
        window.getComputedStyle(el).overflowX,
      );
      expect(overflow).toBe('auto');
      await context.close();
    });
  });

  test.describe('Page layout on mobile', () => {
    test('page header wraps properly on mobile (no overflow)', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await setupPage(page, '/patients');

      const body = await page.locator('body').boundingBox();
      const content = await page.locator('.page__header').boundingBox();

      if (body && content) {
        expect(content.width).toBeLessThanOrEqual(body.width + 2); // 2px tolerance
      }
      await context.close();
    });

    test('search input takes full width on mobile', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await setupPage(page, '/patients');

      const input = page.locator('input.search-input');
      const inputBox = await input.boundingBox();
      const viewport = page.viewportSize();

      if (inputBox && viewport) {
        // Full-width search: width should be close to viewport width minus padding
        expect(inputBox.width).toBeGreaterThan(viewport.width * 0.7);
      }
      await context.close();
    });
  });

  test.describe('Login page on mobile', () => {
    test('shows form panel (hides brand panel)', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await page.goto('/auth/login');

      await expect(page.locator('.login-page__form-panel')).toBeVisible();
      // Brand panel is hidden on mobile via CSS
      const brandPanel = page.locator('.login-page__brand');
      const display = await brandPanel.evaluate((el) =>
        window.getComputedStyle(el).display,
      );
      expect(display).toBe('none');
      await context.close();
    });
  });

  test.describe('Calendar on mobile', () => {
    test('calendar grid has horizontal scroll wrapper', async ({ browser }) => {
      const context = await browser.newContext({ ...iphone });
      const page = await context.newPage();
      await setupPage(page, '/calendar');

      await expect(page.locator('.calendar-grid-wrap')).toBeVisible();
      const overflow = await page.locator('.calendar-grid-wrap').evaluate((el) =>
        window.getComputedStyle(el).overflowX,
      );
      expect(overflow).toBe('auto');
      await context.close();
    });
  });
});
