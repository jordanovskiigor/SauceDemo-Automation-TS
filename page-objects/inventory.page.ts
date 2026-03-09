import { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = this.page.locator('.shopping_cart_link');
    this.cartBadge = this.page.locator('.shopping_cart_badge');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  private inventoryItem(itemName: string): Locator {
    return this.page
      .locator('.inventory_item')
      .filter({ has: this.page.locator('.inventory_item_name', { hasText: itemName }) });
  }

  addToCartButton(itemName: string): Locator {
    return this.inventoryItem(itemName).locator('button:has-text("Add to cart")');
  }

  removeButton(itemName: string): Locator {
    return this.inventoryItem(itemName).locator('button:has-text("Remove")');
  }

  async addItemToCart(itemName: string) {
    await this.addToCartButton(itemName).click();
  }

  async removeItemFromInventory(itemName: string) {
    await this.removeButton(itemName).click();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async getCartBadgeCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    const text = (await this.cartBadge.textContent())?.trim();
    if (!text) return 0;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
