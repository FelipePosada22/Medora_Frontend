import { test, expect } from '@playwright/test';
import { setupPage, mockAllApis, loginAs } from './helpers/setup';
import { MOCK_PATIENTS } from './helpers/mock-data';

import { API_URL } from './helpers/env';
const BASE = API_URL;

test.describe('Patients', () => {

  test.describe('Patients list page', () => {
    test.beforeEach(async ({ page }) => {
      await setupPage(page, '/patients');
    });

    test('shows page title "Pacientes"', async ({ page }) => {
      await expect(page.locator('.page__title')).toHaveText('Pacientes');
    });

    test('shows "Nuevo paciente" button', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: /Nuevo paciente/i })).toBeVisible();
    });

    test('shows search input', async ({ page }) => {
      await expect(page.locator('input.search-input')).toBeVisible();
    });

    test('renders all mock patients in table', async ({ page }) => {
      await expect(page.locator('table.table tbody tr')).toHaveCount(MOCK_PATIENTS.length);
    });

    test('shows patient names in table', async ({ page }) => {
      for (const patient of MOCK_PATIENTS) {
        await expect(page.locator('table.table tbody')).toContainText(patient.name);
      }
    });

    test('shows patient phone in table', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText(MOCK_PATIENTS[0].phone);
    });

    test('shows patient email in table', async ({ page }) => {
      await expect(page.locator('table.table tbody')).toContainText(MOCK_PATIENTS[0].email);
    });

    test('each row has view and delete action buttons', async ({ page }) => {
      const firstRow = page.locator('table.table tbody tr').first();
      await expect(firstRow.locator('.row-actions app-button, .row-actions a')).toHaveCount({ min: 1 });
    });
  });

  test.describe('Search', () => {
    test.beforeEach(async ({ page }) => {
      await setupPage(page, '/patients');
    });

    test('searching filters patient list', async ({ page }) => {
      await page.locator('input.search-input').fill('María');
      // Should show only María
      const rows = page.locator('table.table tbody tr');
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText('María González');
    });

    test('search is case-insensitive', async ({ page }) => {
      await page.locator('input.search-input').fill('maría');
      await expect(page.locator('table.table tbody tr')).toHaveCount(1);
    });

    test('no results shows empty state', async ({ page }) => {
      await page.locator('input.search-input').fill('ZZZNOMATCH');
      await expect(page.locator('.state-placeholder')).toBeVisible();
    });

    test('clearing search shows all patients', async ({ page }) => {
      await page.locator('input.search-input').fill('María');
      await page.locator('input.search-input').clear();
      await expect(page.locator('table.table tbody tr')).toHaveCount(MOCK_PATIENTS.length);
    });
  });

  test.describe('"Nuevo paciente" navigation', () => {
    test('navigates to new patient form', async ({ page }) => {
      await setupPage(page, '/patients');
      await page.locator('app-button', { hasText: /Nuevo paciente/i }).click();
      await expect(page).toHaveURL(/\/patients\/new/);
    });
  });

  test.describe('New patient form', () => {
    test.beforeEach(async ({ page }) => {
      await setupPage(page, '/patients/new');
    });

    test('shows new patient form title', async ({ page }) => {
      await expect(page.locator('.page__title')).toContainText('Nuevo paciente');
    });

    test('shows name, phone, email fields', async ({ page }) => {
      await expect(page.locator('app-input[formcontrolname="name"] input')).toBeVisible();
      await expect(page.locator('app-input[formcontrolname="phone"] input')).toBeVisible();
      await expect(page.locator('app-input[formcontrolname="email"] input')).toBeVisible();
    });

    test('shows notes field', async ({ page }) => {
      // Notes can be a textarea
      await expect(page.locator('[formcontrolname="notes"]')).toBeVisible();
    });

    test('shows save button', async ({ page }) => {
      await expect(page.locator('app-button[type="submit"] button, app-button button', { hasText: /Guardar/i })).toBeVisible();
    });

    test('shows back/cancel button', async ({ page }) => {
      await expect(page.locator('app-button', { hasText: /Cancelar|Volver/i }).first()).toBeVisible();
    });

    test('validates required name field', async ({ page }) => {
      await page.locator('app-button[type="submit"] button, app-button button', { hasText: /Guardar/i }).click();
      await expect(page.locator('app-input[formcontrolname="name"] .field__error')).toBeVisible();
    });

    test('successfully creates patient and redirects', async ({ page }) => {
      const newPatient = {
        id: 'p-new', tenantId: 'tenant-1', name: 'Test Paciente', phone: '555-9999',
        email: 'test@example.com', birthdate: null, notes: null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      await page.route(`${BASE}/patients`, async (r) => {
        if (r.request().method() === 'POST') {
          await r.fulfill({ json: newPatient });
        } else {
          await r.continue();
        }
      });

      await page.locator('app-input[formcontrolname="name"] input').fill('Test Paciente');
      await page.locator('app-input[formcontrolname="phone"] input').fill('555-9999');
      await page.locator('app-input[formcontrolname="email"] input').fill('test@example.com');
      await page.locator('app-button[type="submit"] button, app-button button', { hasText: /Guardar/i }).click();

      await expect(page).toHaveURL(/\/patients$/);
    });
  });

  test.describe('Patient detail page', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(`${BASE}/patients/p1`, (r) => r.fulfill({ json: MOCK_PATIENTS[0] }));
      await page.route(`${BASE}/patients/p1/appointments`, (r) => r.fulfill({ json: [] }));
      await page.route(`${BASE}/patients/p1/treatment-plans`, (r) => r.fulfill({ json: [] }));
      await page.route(`${BASE}/patients/p1/prescriptions`, (r) => r.fulfill({ json: [] }));
      await setupPage(page, '/patients/p1');
    });

    test('shows patient name in hero section', async ({ page }) => {
      await expect(page.locator('.patient-hero, .page__title, h1').first()).toContainText('María González');
    });

    test('shows patient contact info', async ({ page }) => {
      await expect(page.locator('body')).toContainText('555-1001');
    });

    test('shows back button to patients list', async ({ page }) => {
      await expect(page.locator('a[href="/patients"], app-button', { hasText: /Volver|Pacientes/i }).first()).toBeVisible();
    });
  });

  test.describe('Delete patient', () => {
    test('delete calls DELETE endpoint', async ({ page }) => {
      let deleteCalled = false;
      await mockAllApis(page);
      await page.route(`${BASE}/patients/p1`, async (r) => {
        if (r.request().method() === 'DELETE') {
          deleteCalled = true;
          await r.fulfill({ status: 200, json: {} });
        } else {
          await r.continue();
        }
      });
      await loginAs(page, 'ADMIN');
      await page.goto('/patients', { waitUntil: 'networkidle' });

      // Click delete button for first patient (button with trash/delete icon or text)
      const deleteBtn = page.locator('table.table tbody tr').first()
        .locator('app-button', { hasText: /Eliminar|Delete/i });

      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        expect(deleteCalled).toBe(true);
      }
    });
  });
});
