import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login.page';
import { InventoryPage } from '../../page-objects/inventory.page';
import { CartPage } from '../../page-objects/cart.page';
import users from '../../test-data/users.json';

test.describe('cart scenarios', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  const item1 = 'Sauce Labs Backpack';
  const item2 = 'Sauce Labs Bike Light';
  const item3 = 'Sauce Labs Bolt T-Shirt';

  test.beforeEach(async ({ page }) => {
    const validUser = users.find(user => user.scenario === 'valid_credentials');
    if (!validUser) {
      throw new Error('Test data not found for valid credentials scenario.');
    }

    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(validUser.username, validUser.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('adding a single item to cart', async ({ page }) => {
    await inventoryPage.addItemToCart(item1);
    await expect.poll(async () => inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.itemName(item1)).toBeVisible();
  });

  test('adding multiple items to cart', async ({ page }) => {
    await inventoryPage.addItemToCart(item1);
    await inventoryPage.addItemToCart(item2);
    await inventoryPage.addItemToCart(item3);

    await expect.poll(async () => inventoryPage.getCartBadgeCount()).toBe(3);

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.itemName(item1)).toBeVisible();
    await expect(cartPage.itemName(item2)).toBeVisible();
    await expect(cartPage.itemName(item3)).toBeVisible();
  });

  test('removing an item from cart', async ({ page }) => {
    await inventoryPage.addItemToCart(item1);
    await inventoryPage.addItemToCart(item2);
    await expect.poll(async () => inventoryPage.getCartBadgeCount()).toBe(2);

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/cart\.html/);

    await cartPage.removeItem(item1);
    await expect(cartPage.itemName(item1)).toHaveCount(0);
    await expect(cartPage.itemName(item2)).toBeVisible();
    await expect.poll(async () => cartPage.getCartBadgeCount()).toBe(1);
  });

  test('verifying cart badge count updates correctly', async () => {
    await expect.poll(async () => inventoryPage.getCartBadgeCount()).toBe(0);

    await inventoryPage.addItemToCart(item1);
    await expect.poll(async () => inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.addItemToCart(item2);
    await expect.poll(async () => inventoryPage.getCartBadgeCount()).toBe(2);

    await inventoryPage.removeItemFromInventory(item1);
    await expect.poll(async () => inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.goToCart();
    await cartPage.removeItem(item2);
    await expect.poll(async () => cartPage.getCartBadgeCount()).toBe(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });
});
