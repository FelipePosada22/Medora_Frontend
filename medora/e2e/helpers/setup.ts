import { Page } from '@playwright/test';
import { USE_MOCKS, API_URL, CREDENTIALS, UserRole } from './env';
import { ADMIN_TOKEN, DOCTOR_TOKEN, RECEPTIONIST_TOKEN, AUXILIARY_TOKEN } from './fake-jwt';
import {
  MOCK_PATIENTS, MOCK_PROFESSIONALS, MOCK_APPOINTMENT_TYPES, MOCK_APPOINTMENTS,
  MOCK_DASHBOARD, MOCK_BILLING, MOCK_SCHEDULES, MOCK_PRESCRIPTIONS,
  MOCK_TREATMENT_PLANS, MOCK_SETTINGS,
} from './mock-data';

const FAKE_TOKEN_MAP: Record<UserRole, string> = {
  ADMIN:        ADMIN_TOKEN,
  DOCTOR:       DOCTOR_TOKEN,
  RECEPTIONIST: RECEPTIONIST_TOKEN,
  AUXILIARY:    AUXILIARY_TOKEN,
};

// ─── Login ───────────────────────────────────────────────────────────────────

/**
 * Authenticates in the browser.
 *
 * • LOCAL mode  (E2E_USE_MOCKS=true):  injects a fake JWT — no network call.
 * • DEV mode    (E2E_USE_MOCKS=false): fills the real login form and submits.
 */
export async function loginAs(page: Page, role: UserRole = 'ADMIN') {
  if (USE_MOCKS) {
    await _injectFakeToken(page, role);
  } else {
    await _realLogin(page, role);
  }
}

async function _injectFakeToken(page: Page, role: UserRole) {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    (token) => localStorage.setItem('medora_access_token', token),
    FAKE_TOKEN_MAP[role],
  );
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
}

async function _realLogin(page: Page, role: UserRole) {
  const { email, password } = CREDENTIALS[role];
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await page.locator('app-input[formcontrolname="email"] input').fill(email);
  await page.locator('app-input[formcontrolname="password"] input').fill(password);
  await page.locator('app-button[type="submit"] button').click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

// ─── API mocks ───────────────────────────────────────────────────────────────

/**
 * Intercepts all backend API calls and returns fixture data.
 * Only active in LOCAL mode — in DEV mode real API calls flow through.
 */
export async function mockAllApis(page: Page) {
  if (!USE_MOCKS) return;

  await page.route(`${API_URL}/dashboard**`, (r) =>
    r.fulfill({ json: MOCK_DASHBOARD }),
  );
  await page.route(`${API_URL}/appointments/calendar**`, (r) =>
    r.fulfill({ json: MOCK_APPOINTMENTS }),
  );
  await page.route(`${API_URL}/appointments**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_APPOINTMENTS })
      : r.continue();
  });
  await page.route(`${API_URL}/patients**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_PATIENTS })
      : r.continue();
  });
  await page.route(`${API_URL}/professionals**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_PROFESSIONALS })
      : r.continue();
  });
  await page.route(`${API_URL}/appointment-types**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_APPOINTMENT_TYPES })
      : r.continue();
  });
  await page.route(`${API_URL}/billing**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_BILLING })
      : r.continue();
  });
  await page.route(`${API_URL}/schedules**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_SCHEDULES })
      : r.continue();
  });
  await page.route(`${API_URL}/prescriptions**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_PRESCRIPTIONS })
      : r.continue();
  });
  await page.route(`${API_URL}/treatment-plans**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_TREATMENT_PLANS })
      : r.continue();
  });
  await page.route(`${API_URL}/settings**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_SETTINGS })
      : r.continue();
  });
  await page.route(`${API_URL}/users**`, async (r) => {
    r.request().method() === 'GET'
      ? r.fulfill({ json: MOCK_SETTINGS.users })
      : r.continue();
  });
}

// ─── Convenience ─────────────────────────────────────────────────────────────

/** One-liner: mock APIs (if local) + login + navigate to route. */
export async function setupPage(page: Page, route: string, role: UserRole = 'ADMIN') {
  await mockAllApis(page);
  await loginAs(page, role);
  if (!page.url().includes(route.replace(/\/$/, ''))) {
    await page.goto(route, { waitUntil: 'networkidle' });
  }
}
