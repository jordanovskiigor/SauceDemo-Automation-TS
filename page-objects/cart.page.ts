import { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = this.page.locator('.cart_item');
    this.cartBadge = this.page.locator('.shopping_cart_badge');
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  itemName(itemName: string): Locator {
    return this.page.locator('.cart_item .inventory_item_name', { hasText: itemName });
  }

  removeButtonForItem(itemName: string): Locator {
    return this.page
      .locator('.cart_item')
      .filter({ has: this.page.locator('.inventory_item_name', { hasText: itemName }) })
      .locator('button:has-text("Remove")');
  }

  async removeItem(itemName: string) {
    await this.removeButtonForItem(itemName).click();
  }

  async getCartBadgeCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    const text = (await this.cartBadge.textContent())?.trim();
    if (!text) return 0;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
