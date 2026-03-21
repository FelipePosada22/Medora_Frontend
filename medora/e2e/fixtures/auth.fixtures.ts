import { Page } from '@playwright/test';

export const ADMIN_USER = {
  email: 'admin@medora.com',
  password: 'Admin123!',
};

export const DOCTOR_USER = {
  email: 'doctor@medora.com',
  password: 'Doctor123!',
};

export const RECEPTIONIST_USER = {
  email: 'recepcionista@medora.com',
  password: 'Recep123!',
};

export const AUXILIARY_USER = {
  email: 'auxiliar@medora.com',
  password: 'Aux123!',
};

/** Inject a valid token into localStorage to bypass the login form. */
export async function injectAuthToken(
  page: Page,
  token: string,
  role: string,
  name = 'Test User',
  id = '1',
) {
  await page.goto('/auth/login');
  await page.evaluate(
    ({ token, role, name, id }) => {
      localStorage.setItem('medora_access_token', token);
      const user = { id, name, email: 'test@medora.com', role, tenant_id: '1' };
      sessionStorage.setItem('medora_user', JSON.stringify(user));
    },
    { token, role, name, id },
  );
}
