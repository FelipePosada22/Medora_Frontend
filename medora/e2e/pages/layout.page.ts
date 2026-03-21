import { Page, expect } from '@playwright/test';

export class LayoutPage {
  constructor(private page: Page) {}

  async clickNavItem(label: string) {
    await this.page.locator('.sidebar__link', { hasText: label }).click();
  }

  async expectPageTitle(title: string) {
    await expect(this.page.locator('.header__title')).toContainText(title);
  }

  async expectNavItemVisible(label: string) {
    await expect(this.page.locator('.sidebar__link', { hasText: label })).toBeVisible();
  }

  async expectNavItemHidden(label: string) {
    await expect(this.page.locator('.sidebar__link', { hasText: label })).toBeHidden();
  }

  async toggleSidebarCollapse() {
    await this.page.locator('.sidebar__toggle--desktop').click();
  }

  async openMobileMenu() {
    await this.page.locator('.header__hamburger').click();
  }

  async closeMobileMenu() {
    await this.page.locator('.sidebar__toggle--mobile').click();
  }

  async openUserMenu() {
    await this.page.locator('.header__user-btn').click();
  }

  async logout() {
    await this.openUserMenu();
    await this.page.locator('.header__dropdown-item--danger', { hasText: 'Cerrar sesión' }).click();
  }

  async expectSidebarCollapsed() {
    await expect(this.page.locator('.sidebar')).toHaveClass(/sidebar--collapsed/);
  }

  async expectSidebarExpanded() {
    await expect(this.page.locator('.sidebar')).not.toHaveClass(/sidebar--collapsed/);
  }
}
