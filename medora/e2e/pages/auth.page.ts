import { Page, expect } from '@playwright/test';

export class AuthPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth/login');
  }

  async fillEmail(email: string) {
    await this.page.locator('app-input[formcontrolname="email"] input').fill(email);
  }

  async fillPassword(password: string) {
    await this.page.locator('app-input[formcontrolname="password"] input').fill(password);
  }

  async submit() {
    await this.page.locator('app-button[type="submit"] button').click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async expectErrorMessage(msg: string) {
    await expect(this.page.locator('.login-page__error')).toContainText(msg);
  }

  async expectRedirectedToDashboard() {
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async expectRedirectedToCalendar() {
    await this.page.waitForURL('**/calendar', { timeout: 10000 });
    await expect(this.page).toHaveURL(/\/calendar/);
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/auth\/login/);
    await expect(this.page.locator('.login-page__title')).toBeVisible();
  }
}
