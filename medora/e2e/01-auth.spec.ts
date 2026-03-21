import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { mockAllApis, loginAs } from './helpers/setup';
import { API_URL } from './helpers/env';

const BASE_URL = API_URL;

test.describe('Authentication', () => {

  test.describe('Login page appearance', () => {
    test('shows login page at /auth/login', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page.locator('.login-page__title')).toHaveText('Bienvenido');
      await expect(page.locator('.login-page__subtitle')).toContainText('Ingresa a tu cuenta');
      await expect(page.locator('.login-page__brand-name')).toHaveText('Medora');
    });

    test('shows email and password inputs', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page.locator('app-input[formcontrolname="email"] input')).toBeVisible();
      await expect(page.locator('app-input[formcontrolname="password"] input')).toBeVisible();
    });

    test('shows submit button', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page.locator('app-button[type="submit"] button')).toContainText('Iniciar sesión');
    });

    test('redirects unauthenticated user from /dashboard to login', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('redirects from / to login when unauthenticated', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Login form validation', () => {
    test('shows validation error for empty email', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goto();
      // Submit without filling anything
      await auth.submit();
      // Email field should show error
      await expect(page.locator('app-input[formcontrolname="email"] .field__error')).toBeVisible();
    });

    test('shows validation error for invalid email format', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goto();
      await auth.fillEmail('notanemail');
      await auth.submit();
      await expect(page.locator('app-input[formcontrolname="email"] .field__error')).toBeVisible();
    });

    test('shows validation error for empty password', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goto();
      await auth.fillEmail('user@test.com');
      await auth.submit();
      await expect(page.locator('app-input[formcontrolname="password"] .field__error')).toBeVisible();
    });
  });

  test.describe('Login with mocked API', () => {
    test('successful login redirects to dashboard for ADMIN/DOCTOR/RECEPTIONIST', async ({ page }) => {
      const fakeToken = require('./helpers/fake-jwt').ADMIN_TOKEN;
      await page.route(`${BASE_URL}/auth/login`, (r) =>
        r.fulfill({
          json: {
            access_token: fakeToken,
            refresh_token: 'fake_refresh',
            user: { id: '1', full_name: 'Admin Medora', email: 'admin@medora.com', role: 'ADMIN', tenant_id: 'tenant-1' },
          },
        }),
      );
      await mockAllApis(page);

      const auth = new AuthPage(page);
      await auth.login('admin@medora.com', 'anypassword');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('failed login shows error message', async ({ page }) => {
      await page.route(`${BASE_URL}/auth/login`, (r) =>
        r.fulfill({
          status: 401,
          json: { message: 'Credenciales inválidas' },
        }),
      );

      const auth = new AuthPage(page);
      await auth.login('wrong@email.com', 'wrongpassword');
      await auth.expectErrorMessage('Credenciales inválidas');
    });

    test('loading state is shown during login', async ({ page }) => {
      let resolveLogin!: () => void;
      const fakeToken = require('./helpers/fake-jwt').ADMIN_TOKEN;

      await page.route(`${BASE_URL}/auth/login`, async (r) => {
        await new Promise<void>((res) => { resolveLogin = res; });
        await r.fulfill({
          json: {
            access_token: fakeToken, refresh_token: 'fake_refresh',
            user: { id: '1', full_name: 'Admin Medora', email: 'admin@medora.com', role: 'ADMIN', tenant_id: 'tenant-1' },
          },
        });
      });

      const auth = new AuthPage(page);
      await auth.goto();
      await auth.fillEmail('admin@medora.com');
      await auth.fillPassword('password');

      const submitBtn = page.locator('app-button[type="submit"] button');
      await submitBtn.click();

      // Button should be disabled while loading
      await expect(submitBtn).toBeDisabled();
      resolveLogin();
    });
  });

  test.describe('Session restoration', () => {
    test('restores session from token in localStorage', async ({ page }) => {
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('.sidebar__user-name')).toContainText('Admin Medora');
    });

    test('clears invalid token and redirects to login', async ({ page }) => {
      await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => localStorage.setItem('medora_access_token', 'invalid.token'));
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('clears expired token and redirects to login', async ({ page }) => {
      const { createFakeJwt } = require('./helpers/fake-jwt');
      const expiredToken = createFakeJwt({
        sub: '1', name: 'Admin', email: 'admin@medora.com',
        role: 'ADMIN', tenantId: 'tenant-1',
        exp: Math.floor(Date.now() / 1000) - 3600, // expired 1h ago
      });
      await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
      await page.evaluate((t) => localStorage.setItem('medora_access_token', t), expiredToken);
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Logout', () => {
    test('logout clears session and redirects to login', async ({ page }) => {
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');

      // Open user menu and logout
      await page.locator('.header__user-btn').click();
      await page.locator('.header__dropdown-item--danger').click();

      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('after logout, accessing protected route redirects to login', async ({ page }) => {
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');

      await page.locator('.header__user-btn').click();
      await page.locator('.header__dropdown-item--danger').click();
      await expect(page).toHaveURL(/\/auth\/login/);

      // Try to go to protected route
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Guest guard', () => {
    test('authenticated user visiting /auth/login is redirected', async ({ page }) => {
      await mockAllApis(page);
      await loginAs(page, 'ADMIN');
      // Now visit login again
      await page.goto('/auth/login');
      // Should redirect away from login
      await expect(page).not.toHaveURL(/\/auth\/login/);
    });
  });
});
